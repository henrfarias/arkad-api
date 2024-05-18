/*
  Warnings:

  - Added the required column `data_calculo` to the `taxa_projetiva` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "taxa_projetiva" ADD COLUMN     "data_calculo" TIMESTAMP(3) NOT NULL;
