import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropTables1631263253639 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE IF EXISTS bucket;
      DROP TABLE IF EXISTS file;
      DROP TABLE IF EXISTS folder;`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      ` --
        -- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
        --

        CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


        --
        -- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner:
        --

        COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';

        --
        -- Name: bucket; Type: TABLE; Schema: public; Owner: dashboard_user
        --

        CREATE TABLE public.bucket (
            name character varying NOT NULL,
            owner character varying NOT NULL,
            access character varying NOT NULL,
            "filesCount" integer DEFAULT 0 NOT NULL,
            "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
            "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
            __v integer NOT NULL,
            region jsonb,
            storage jsonb
        );

        --
        -- Name: file; Type: TABLE; Schema: public; Owner: dashboard_user
        --

        CREATE TABLE public.file (
            id character varying NOT NULL,
            type character varying NOT NULL,
            bucket character varying NOT NULL,
            path character varying NOT NULL,
            "defaultName" character varying NOT NULL,
            region character varying NOT NULL,
            size integer NOT NULL,
            access character varying DEFAULT 'private'::character varying NOT NULL,
            "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
            "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
            __v integer NOT NULL,
            "pathLocal" character varying NOT NULL,
            meta jsonb
        );

        --
        -- Name: folder; Type: TABLE; Schema: public; Owner: dashboard_user
        --

        CREATE TABLE public.folder (
            id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
            bucket character varying NOT NULL,
            name character varying NOT NULL,
            storage character varying NOT NULL,
            size integer DEFAULT 0 NOT NULL,
            path character varying NOT NULL,
            access character varying DEFAULT 'private'::character varying NOT NULL,
            "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
            "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
            __v integer NOT NULL
        );

        --
        -- Name: file PK_36b46d232307066b3a2c9ea3a1d; Type: CONSTRAINT; Schema: public; Owner: dashboard_user
        --

        ALTER TABLE ONLY public.file
            ADD CONSTRAINT "PK_36b46d232307066b3a2c9ea3a1d" PRIMARY KEY (id);


        --
        -- Name: folder PK_6278a41a706740c94c02e288df8; Type: CONSTRAINT; Schema: public; Owner: dashboard_user
        --

        ALTER TABLE ONLY public.folder
            ADD CONSTRAINT "PK_6278a41a706740c94c02e288df8" PRIMARY KEY (id);


        --
        -- Name: bucket PK_7bd6e5be634c7e3eb1f2474047a; Type: CONSTRAINT; Schema: public; Owner: dashboard_user
        --

        ALTER TABLE ONLY public.bucket
            ADD CONSTRAINT "PK_7bd6e5be634c7e3eb1f2474047a" PRIMARY KEY (name);


        --
        -- Name: IDX_048a50245110d5a316d72b4141; Type: INDEX; Schema: public; Owner: dashboard_user
        --

        CREATE INDEX "IDX_048a50245110d5a316d72b4141" ON public.folder USING btree (bucket);


        --
        -- Name: IDX_065275c445484bc0702ce929c1; Type: INDEX; Schema: public; Owner: dashboard_user
        --

        CREATE INDEX "IDX_065275c445484bc0702ce929c1" ON public.file USING btree (bucket);


        --
        -- Name: IDX_36b46d232307066b3a2c9ea3a1; Type: INDEX; Schema: public; Owner: dashboard_user
        --

        CREATE UNIQUE INDEX "IDX_36b46d232307066b3a2c9ea3a1" ON public.file USING btree (id);


        --
        -- Name: IDX_5fdc1afff14d2ffa34471076dc; Type: INDEX; Schema: public; Owner: dashboard_user
        --

        CREATE INDEX "IDX_5fdc1afff14d2ffa34471076dc" ON public.folder USING btree (path);


        --
        -- Name: IDX_6c1d94a58a2bd91753e7be9d9d; Type: INDEX; Schema: public; Owner: dashboard_user
        --

        CREATE INDEX "IDX_6c1d94a58a2bd91753e7be9d9d" ON public.folder USING btree (name);`,
    );
  }
}
