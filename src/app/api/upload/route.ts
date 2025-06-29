import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { auth } from "@/auth";
import { nanoid } from "nanoid";

const s3Client = new S3Client({
  region: process.env.AWS_S3_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function POST(req: Request) {
  const session = await auth();

  // 1. Verificação de Autenticação (Apenas admins podem fazer upload)
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
  }

  try {
    const { filename, contentType } = await req.json();

    if (!filename || !contentType) {
      return NextResponse.json(
        { error: "Nome do arquivo ou tipo de conteúdo ausente." },
        { status: 400 }
      );
    }

    // 2. Criação de um nome de arquivo único para evitar conflitos
    const uniqueFileName = `${nanoid()}-${filename}`;

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: uniqueFileName,
      ContentType: contentType,
    });

    // 3. Geração da URL pré-assinada com validade de 10 minutos
    const presignedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 600, // 10 minutes
    });

    // 4. Retorno da URL para o cliente
    return NextResponse.json({
      url: presignedUrl,
      publicUrl: `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${uniqueFileName}`,
    });
  } catch (error) {
    console.error("Erro ao gerar URL de upload:", error);
    return NextResponse.json(
      { error: "Falha ao processar o upload." },
      { status: 500 }
    );
  }
}
