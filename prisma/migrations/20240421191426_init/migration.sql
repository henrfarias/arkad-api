-- CreateEnum
CREATE TYPE "Indexes" AS ENUM ('selic', 'poup');

-- CreateEnum
CREATE TYPE "Frequency" AS ENUM ('diaria', 'mensal', 'anual');

-- CreateEnum
CREATE TYPE "InvestmentType" AS ENUM ('mensal');

-- CreateTable
CREATE TABLE "titulo_tesouro" (
    "id" TEXT NOT NULL,
    "titulo" VARCHAR(100) NOT NULL,
    "data_ref" TIMESTAMP(3) NOT NULL,
    "vencimento" TIMESTAMP(3) NOT NULL,
    "indice" "Indexes" NOT NULL,
    "taxa_compra" DOUBLE PRECISION NOT NULL,
    "pu_compra" INTEGER NOT NULL,
    "pu_venda" INTEGER NOT NULL,

    CONSTRAINT "titulo_tesouro_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "indices" (
    "id" TEXT NOT NULL,
    "indice" "Indexes" NOT NULL,
    "taxa" DOUBLE PRECISION NOT NULL,
    "data_ref" TIMESTAMP(3) NOT NULL,
    "frequencia" "Frequency" NOT NULL,

    CONSTRAINT "indices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "taxa_projetiva" (
    "id" TEXT NOT NULL,
    "taxa_anual" DOUBLE PRECISION NOT NULL,
    "indice" "Indexes" NOT NULL,
    "ano_ref" INTEGER NOT NULL,

    CONSTRAINT "taxa_projetiva_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "simulacao_poupanca" (
    "id" TEXT NOT NULL,
    "id_taxa_inicial" TEXT NOT NULL,
    "id_simulacao_tesouro" TEXT NOT NULL,
    "valor_inicial" INTEGER NOT NULL,
    "aporte" INTEGER,
    "qtd_aportes" INTEGER,
    "tipo_aporte" "InvestmentType" NOT NULL,
    "evolucao_patrimonial" JSONB NOT NULL,
    "resultado" INTEGER NOT NULL,
    "rendimento" DOUBLE PRECISION NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "simulacao_poupanca_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "simulacao_tesouro" (
    "id" TEXT NOT NULL,
    "id_titulo_inicial" TEXT NOT NULL,
    "valor_inicial" INTEGER NOT NULL,
    "aporte" INTEGER,
    "qtd_aportes" INTEGER,
    "tipo_aporte" "InvestmentType" NOT NULL,
    "evolucao_patrimonial" JSONB NOT NULL,
    "resultado_bruto" INTEGER NOT NULL,
    "ir_retido_total" INTEGER NOT NULL,
    "taxa_b3_total" INTEGER NOT NULL,
    "rendimento_bruto" DOUBLE PRECISION NOT NULL,
    "rendimento_liquido" DOUBLE PRECISION NOT NULL,
    "data_ref" TIMESTAMP(3) NOT NULL,
    "ip" TEXT NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "simulacao_tesouro_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "simulacao_poupanca" ADD CONSTRAINT "simulacao_poupanca_id_taxa_inicial_fkey" FOREIGN KEY ("id_taxa_inicial") REFERENCES "indices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "simulacao_poupanca" ADD CONSTRAINT "simulacao_poupanca_id_simulacao_tesouro_fkey" FOREIGN KEY ("id_simulacao_tesouro") REFERENCES "simulacao_tesouro"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "simulacao_tesouro" ADD CONSTRAINT "simulacao_tesouro_id_titulo_inicial_fkey" FOREIGN KEY ("id_titulo_inicial") REFERENCES "titulo_tesouro"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
