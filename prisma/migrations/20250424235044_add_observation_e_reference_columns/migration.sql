-- AlterTable
ALTER TABLE "Address" ADD COLUMN     "observation" TEXT,
ADD COLUMN     "reference" TEXT,
ALTER COLUMN "zipCode" DROP NOT NULL;
