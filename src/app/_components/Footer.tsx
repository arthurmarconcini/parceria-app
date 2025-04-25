// components/Footer.jsx
import { Instagram, Facebook, MapPin, Phone, Utensils } from "lucide-react";
import Link from "next/link";
import { Button } from "@/app/_components/ui/button";

export default function Footer() {
  return (
    <footer className="bg-background border-t border-border py-6">
      <div className="container mx-auto px-4">
        {/* Seção Superior: Branding e Call-to-Action */}
        <div className="flex flex-col items-center md:flex-row md:justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Utensils className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-bold text-foreground">
              Parceira Beer Burguer
            </h2>
          </div>
          <Button
            asChild
            className="bg-primary text-primary-foreground hover:bg-primary/90 w-full md:w-auto"
          >
            <Link
              href="https://wa.me/5527998941234?text=Quero%20fazer%20um%20pedido!"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Phone className="h-4 w-4 mr-2" />
              Peça pelo WhatsApp
            </Link>
          </Button>
        </div>

        {/* Seção Central: Informações e Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          {/* Localização */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Onde Estamos
            </h3>
            <p className="flex items-center justify-center md:justify-start gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              Rua Padre José de Anchieta, 215, Ipiranga
            </p>
          </div>

          {/* Redes Sociais */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Siga-nos
            </h3>
            <div className="flex justify-center md:justify-start gap-4">
              <Link
                href="https://www.instagram.com/parceriabeerburguer/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Instagram className="h-6 w-6" />
                <span className="sr-only">Instagram</span>
              </Link>
              <Link
                href="https://www.facebook.com/parceriabeerbar/?locale=pt_BR"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Facebook className="h-6 w-6" />
                <span className="sr-only">Facebook</span>
              </Link>
            </div>
          </div>

          {/* Links Úteis */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Links Úteis
            </h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <Link href="/" className="hover:text-primary transition-colors">
                  Cardápio
                </Link>
              </li>
              <li>
                <Link
                  href="https://wa.me/5527998941234"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors"
                >
                  Fale Conosco
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Seção Inferior: Copyright */}
        <div className="mt-6 text-center text-muted-foreground text-sm">
          <p>
            © {new Date().getFullYear()} Parceira Beer Burguer. Todos os
            direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
