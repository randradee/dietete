CREATE TABLE IF NOT EXISTS "__EFMigrationsHistory" (
    "MigrationId" character varying(150) NOT NULL,
    "ProductVersion" character varying(32) NOT NULL,
    CONSTRAINT "PK___EFMigrationsHistory" PRIMARY KEY ("MigrationId")
);

START TRANSACTION;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260424011303_MigracaoInicial') THEN
    CREATE TABLE "GruposFamiliares" (
        "Id" uuid NOT NULL,
        "Nome" character varying(100) NOT NULL,
        "CreatedAt" timestamp with time zone NOT NULL,
        "UpdatedAt" timestamp with time zone,
        CONSTRAINT "PK_GruposFamiliares" PRIMARY KEY ("Id")
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260424011303_MigracaoInicial') THEN
    CREATE TABLE "ListasCompras" (
        "Id" uuid NOT NULL,
        "CriadoPorId" uuid NOT NULL,
        "GrupoFamiliarId" uuid,
        "Periodo" integer NOT NULL,
        "Tipo" integer NOT NULL,
        "DataInicio" date NOT NULL,
        "DataFim" date NOT NULL,
        "CreatedAt" timestamp with time zone NOT NULL,
        "UpdatedAt" timestamp with time zone,
        CONSTRAINT "PK_ListasCompras" PRIMARY KEY ("Id")
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260424011303_MigracaoInicial') THEN
    CREATE TABLE "Papeis" (
        "Id" uuid NOT NULL,
        "Name" character varying(256),
        "NormalizedName" character varying(256),
        "ConcurrencyStamp" text,
        CONSTRAINT "PK_Papeis" PRIMARY KEY ("Id")
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260424011303_MigracaoInicial') THEN
    CREATE TABLE "PrecosItens" (
        "Id" uuid NOT NULL,
        "NomeItem" character varying(200) NOT NULL,
        "Preco" numeric(10,2) NOT NULL,
        "NomeEstabelecimento" character varying(300) NOT NULL,
        "ColetadoEm" timestamp with time zone NOT NULL,
        "ExpiraEm" timestamp with time zone NOT NULL,
        "CreatedAt" timestamp with time zone NOT NULL,
        "UpdatedAt" timestamp with time zone,
        CONSTRAINT "PK_PrecosItens" PRIMARY KEY ("Id")
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260424011303_MigracaoInicial') THEN
    CREATE TABLE "Usuarios" (
        "Id" uuid NOT NULL,
        "NomeCompleto" character varying(150) NOT NULL,
        "GrupoFamiliarId" uuid,
        "TokenAtualizacao" character varying(512),
        "ExpiracaoTokenAtualizacao" timestamp with time zone,
        "UserName" character varying(256),
        "NormalizedUserName" character varying(256),
        "Email" character varying(256),
        "NormalizedEmail" character varying(256),
        "EmailConfirmed" boolean NOT NULL,
        "PasswordHash" text,
        "SecurityStamp" text,
        "ConcurrencyStamp" text,
        "PhoneNumber" text,
        "PhoneNumberConfirmed" boolean NOT NULL,
        "TwoFactorEnabled" boolean NOT NULL,
        "LockoutEnd" timestamp with time zone,
        "LockoutEnabled" boolean NOT NULL,
        "AccessFailedCount" integer NOT NULL,
        CONSTRAINT "PK_Usuarios" PRIMARY KEY ("Id")
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260424011303_MigracaoInicial') THEN
    CREATE TABLE "Usuario" (
        "Id" uuid NOT NULL,
        "NomeCompleto" text NOT NULL,
        "Email" text NOT NULL,
        "GrupoFamiliarId" uuid,
        "CreatedAt" timestamp with time zone NOT NULL,
        "UpdatedAt" timestamp with time zone,
        CONSTRAINT "PK_Usuario" PRIMARY KEY ("Id"),
        CONSTRAINT "FK_Usuario_GruposFamiliares_GrupoFamiliarId" FOREIGN KEY ("GrupoFamiliarId") REFERENCES "GruposFamiliares" ("Id")
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260424011303_MigracaoInicial') THEN
    CREATE TABLE "ItensListaCompras" (
        "Id" uuid NOT NULL,
        "Nome" character varying(200) NOT NULL,
        "QuantidadeTotal" numeric(10,3) NOT NULL,
        "Unidade" integer NOT NULL,
        "Categoria" integer NOT NULL,
        "EditadoManualmente" boolean NOT NULL,
        "PrecoEstimado" numeric(10,2),
        "ListaComprasId" uuid NOT NULL,
        "CreatedAt" timestamp with time zone NOT NULL,
        "UpdatedAt" timestamp with time zone,
        CONSTRAINT "PK_ItensListaCompras" PRIMARY KEY ("Id"),
        CONSTRAINT "FK_ItensListaCompras_ListasCompras_ListaComprasId" FOREIGN KEY ("ListaComprasId") REFERENCES "ListasCompras" ("Id") ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260424011303_MigracaoInicial') THEN
    CREATE TABLE "PapeisReivindicacoes" (
        "Id" integer GENERATED BY DEFAULT AS IDENTITY,
        "RoleId" uuid NOT NULL,
        "ClaimType" text,
        "ClaimValue" text,
        CONSTRAINT "PK_PapeisReivindicacoes" PRIMARY KEY ("Id"),
        CONSTRAINT "FK_PapeisReivindicacoes_Papeis_RoleId" FOREIGN KEY ("RoleId") REFERENCES "Papeis" ("Id") ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260424011303_MigracaoInicial') THEN
    CREATE TABLE "UsuariosLogins" (
        "LoginProvider" text NOT NULL,
        "ProviderKey" text NOT NULL,
        "ProviderDisplayName" text,
        "UserId" uuid NOT NULL,
        CONSTRAINT "PK_UsuariosLogins" PRIMARY KEY ("LoginProvider", "ProviderKey"),
        CONSTRAINT "FK_UsuariosLogins_Usuarios_UserId" FOREIGN KEY ("UserId") REFERENCES "Usuarios" ("Id") ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260424011303_MigracaoInicial') THEN
    CREATE TABLE "UsuariosPapeis" (
        "UserId" uuid NOT NULL,
        "RoleId" uuid NOT NULL,
        CONSTRAINT "PK_UsuariosPapeis" PRIMARY KEY ("UserId", "RoleId"),
        CONSTRAINT "FK_UsuariosPapeis_Papeis_RoleId" FOREIGN KEY ("RoleId") REFERENCES "Papeis" ("Id") ON DELETE CASCADE,
        CONSTRAINT "FK_UsuariosPapeis_Usuarios_UserId" FOREIGN KEY ("UserId") REFERENCES "Usuarios" ("Id") ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260424011303_MigracaoInicial') THEN
    CREATE TABLE "UsuariosReivindicacoes" (
        "Id" integer GENERATED BY DEFAULT AS IDENTITY,
        "UserId" uuid NOT NULL,
        "ClaimType" text,
        "ClaimValue" text,
        CONSTRAINT "PK_UsuariosReivindicacoes" PRIMARY KEY ("Id"),
        CONSTRAINT "FK_UsuariosReivindicacoes_Usuarios_UserId" FOREIGN KEY ("UserId") REFERENCES "Usuarios" ("Id") ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260424011303_MigracaoInicial') THEN
    CREATE TABLE "UsuariosTokens" (
        "UserId" uuid NOT NULL,
        "LoginProvider" text NOT NULL,
        "Name" text NOT NULL,
        "Value" text,
        CONSTRAINT "PK_UsuariosTokens" PRIMARY KEY ("UserId", "LoginProvider", "Name"),
        CONSTRAINT "FK_UsuariosTokens_Usuarios_UserId" FOREIGN KEY ("UserId") REFERENCES "Usuarios" ("Id") ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260424011303_MigracaoInicial') THEN
    CREATE TABLE "PlanosDieta" (
        "Id" uuid NOT NULL,
        "UsuarioId" uuid NOT NULL,
        "NomeArquivoOriginal" character varying(255) NOT NULL,
        "CaminhoArquivo" character varying(500) NOT NULL,
        "Status" integer NOT NULL,
        "MensagemErro" character varying(1000),
        "ProcessadoEm" timestamp with time zone,
        "CreatedAt" timestamp with time zone NOT NULL,
        "UpdatedAt" timestamp with time zone,
        CONSTRAINT "PK_PlanosDieta" PRIMARY KEY ("Id"),
        CONSTRAINT "FK_PlanosDieta_Usuario_UsuarioId" FOREIGN KEY ("UsuarioId") REFERENCES "Usuario" ("Id") ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260424011303_MigracaoInicial') THEN
    CREATE TABLE "DiasDieta" (
        "Id" uuid NOT NULL,
        "PlanoDietaId" uuid NOT NULL,
        "DiaDaSemana" integer,
        "Data" date,
        "OrdemNoDia" integer NOT NULL,
        "CreatedAt" timestamp with time zone NOT NULL,
        "UpdatedAt" timestamp with time zone,
        CONSTRAINT "PK_DiasDieta" PRIMARY KEY ("Id"),
        CONSTRAINT "FK_DiasDieta_PlanosDieta_PlanoDietaId" FOREIGN KEY ("PlanoDietaId") REFERENCES "PlanosDieta" ("Id") ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260424011303_MigracaoInicial') THEN
    CREATE TABLE "Refeicoes" (
        "Id" uuid NOT NULL,
        "Tipo" integer NOT NULL,
        "DiaDietaId" uuid NOT NULL,
        "CreatedAt" timestamp with time zone NOT NULL,
        "UpdatedAt" timestamp with time zone,
        CONSTRAINT "PK_Refeicoes" PRIMARY KEY ("Id"),
        CONSTRAINT "FK_Refeicoes_DiasDieta_DiaDietaId" FOREIGN KEY ("DiaDietaId") REFERENCES "DiasDieta" ("Id") ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260424011303_MigracaoInicial') THEN
    CREATE TABLE "ItensAlimento" (
        "Id" uuid NOT NULL,
        "Nome" character varying(200) NOT NULL,
        "Quantidade" numeric(10,3) NOT NULL,
        "Unidade" integer NOT NULL,
        "PontuacaoConfianca" double precision NOT NULL,
        "RefeicaoId" uuid NOT NULL,
        "CreatedAt" timestamp with time zone NOT NULL,
        "UpdatedAt" timestamp with time zone,
        CONSTRAINT "PK_ItensAlimento" PRIMARY KEY ("Id"),
        CONSTRAINT "FK_ItensAlimento_Refeicoes_RefeicaoId" FOREIGN KEY ("RefeicaoId") REFERENCES "Refeicoes" ("Id") ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260424011303_MigracaoInicial') THEN
    CREATE INDEX "IX_DiasDieta_PlanoDietaId" ON "DiasDieta" ("PlanoDietaId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260424011303_MigracaoInicial') THEN
    CREATE INDEX "IX_ItensAlimento_RefeicaoId" ON "ItensAlimento" ("RefeicaoId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260424011303_MigracaoInicial') THEN
    CREATE INDEX "IX_ItensListaCompras_ListaComprasId" ON "ItensListaCompras" ("ListaComprasId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260424011303_MigracaoInicial') THEN
    CREATE UNIQUE INDEX "RoleNameIndex" ON "Papeis" ("NormalizedName");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260424011303_MigracaoInicial') THEN
    CREATE INDEX "IX_PapeisReivindicacoes_RoleId" ON "PapeisReivindicacoes" ("RoleId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260424011303_MigracaoInicial') THEN
    CREATE INDEX "IX_PlanosDieta_UsuarioId" ON "PlanosDieta" ("UsuarioId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260424011303_MigracaoInicial') THEN
    CREATE INDEX "IX_PrecosItens_NomeItem" ON "PrecosItens" ("NomeItem");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260424011303_MigracaoInicial') THEN
    CREATE INDEX "IX_Refeicoes_DiaDietaId" ON "Refeicoes" ("DiaDietaId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260424011303_MigracaoInicial') THEN
    CREATE INDEX "IX_Usuario_GrupoFamiliarId" ON "Usuario" ("GrupoFamiliarId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260424011303_MigracaoInicial') THEN
    CREATE INDEX "EmailIndex" ON "Usuarios" ("NormalizedEmail");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260424011303_MigracaoInicial') THEN
    CREATE UNIQUE INDEX "UserNameIndex" ON "Usuarios" ("NormalizedUserName");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260424011303_MigracaoInicial') THEN
    CREATE INDEX "IX_UsuariosLogins_UserId" ON "UsuariosLogins" ("UserId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260424011303_MigracaoInicial') THEN
    CREATE INDEX "IX_UsuariosPapeis_RoleId" ON "UsuariosPapeis" ("RoleId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260424011303_MigracaoInicial') THEN
    CREATE INDEX "IX_UsuariosReivindicacoes_UserId" ON "UsuariosReivindicacoes" ("UserId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260424011303_MigracaoInicial') THEN
    INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
    VALUES ('20260424011303_MigracaoInicial', '10.0.7');
    END IF;
END $EF$;
COMMIT;

