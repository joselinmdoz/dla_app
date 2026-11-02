--
-- PostgreSQL database dump
--

\restrict e5IwHRx1mYhomeEXIQUdHr998c4Kh6RsHVWMKtKWXfLB0my37xzcBIdLeBAMzw0

-- Dumped from database version 16.14 (Debian 16.14-1.pgdg13+1)
-- Dumped by pg_dump version 16.14 (Debian 16.14-1.pgdg13+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: CargoType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."CargoType" AS ENUM (
    'MISCELANEA',
    'DURADERO'
);


ALTER TYPE public."CargoType" OWNER TO postgres;

--
-- Name: PaymentMethod; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PaymentMethod" AS ENUM (
    'CASH',
    'ZELLE',
    'TARJETAS',
    'TRANSFERENCIA'
);


ALTER TYPE public."PaymentMethod" OWNER TO postgres;

--
-- Name: Role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."Role" AS ENUM (
    'USER',
    'ADMIN'
);


ALTER TYPE public."Role" OWNER TO postgres;

--
-- Name: ShipmentStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ShipmentStatus" AS ENUM (
    'PENDING',
    'IN_TRANSIT',
    'DELIVERED',
    'CANCELLED'
);


ALTER TYPE public."ShipmentStatus" OWNER TO postgres;

--
-- Name: ShipmentType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ShipmentType" AS ENUM (
    'MARITIMO',
    'AEREO',
    'TERRESTRE'
);


ALTER TYPE public."ShipmentType" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: CargoCatalog; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."CargoCatalog" (
    id text NOT NULL,
    name text NOT NULL,
    code text NOT NULL,
    description text,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."CargoCatalog" OWNER TO postgres;

--
-- Name: Category; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Category" (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    icon text,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Category" OWNER TO postgres;

--
-- Name: Client; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Client" (
    id text NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    phone text NOT NULL,
    address text,
    city text,
    notes text,
    "provinceId" text,
    "provinceText" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Client" OWNER TO postgres;

--
-- Name: FeatureCard; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."FeatureCard" (
    id text NOT NULL,
    "imageUrl" text NOT NULL,
    "altText" text NOT NULL,
    title text,
    description text,
    "linkUrl" text,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."FeatureCard" OWNER TO postgres;

--
-- Name: HeroSlide; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."HeroSlide" (
    id text NOT NULL,
    "imageUrl" text NOT NULL,
    "altText" text NOT NULL,
    title text,
    "linkUrl" text,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."HeroSlide" OWNER TO postgres;

--
-- Name: OfficeImage; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."OfficeImage" (
    id text NOT NULL,
    "imageUrl" text NOT NULL,
    "altText" text NOT NULL,
    title text,
    description text,
    "linkUrl" text,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."OfficeImage" OWNER TO postgres;

--
-- Name: PaymentCatalog; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."PaymentCatalog" (
    id text NOT NULL,
    name text NOT NULL,
    code text NOT NULL,
    description text,
    "isActive" boolean DEFAULT true NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."PaymentCatalog" OWNER TO postgres;

--
-- Name: Product; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Product" (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    price numeric(10,2) NOT NULL,
    "costPrice" numeric(10,2),
    image text,
    "spiceLevel" integer DEFAULT 0 NOT NULL,
    available boolean DEFAULT true NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    content jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "categoryId" text NOT NULL
);


ALTER TABLE public."Product" OWNER TO postgres;

--
-- Name: PromotionCode; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."PromotionCode" (
    id text NOT NULL,
    "promotionName" text NOT NULL,
    "publicCode" text NOT NULL,
    "tokenHash" text NOT NULL,
    status text DEFAULT 'ACTIVE'::text NOT NULL,
    "issuedByUserId" text NOT NULL,
    "issuedByEmail" text,
    "issuedTo" text,
    notes text,
    "expiresAt" timestamp(3) without time zone,
    "redeemedByUserId" text,
    "redeemedByEmail" text,
    "redeemedAt" timestamp(3) without time zone,
    "cancelledByUserId" text,
    "cancelledByEmail" text,
    "cancelledAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."PromotionCode" OWNER TO postgres;

--
-- Name: PromotionCodeAudit; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."PromotionCodeAudit" (
    id text NOT NULL,
    "promotionCodeId" text,
    action text NOT NULL,
    "performedByUserId" text,
    "performedByEmail" text,
    ip text,
    "userAgent" text,
    message text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."PromotionCodeAudit" OWNER TO postgres;

--
-- Name: Province; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Province" (
    id text NOT NULL,
    name text NOT NULL,
    code text,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Province" OWNER TO postgres;

--
-- Name: Shipment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Shipment" (
    id text NOT NULL,
    hbl text NOT NULL,
    "clientId" text NOT NULL,
    address text NOT NULL,
    city text,
    "shippingTypeId" text,
    "cargoTypeId" text,
    "provinceId" text,
    "paymentMethodId" text,
    type public."ShipmentType" DEFAULT 'MARITIMO'::public."ShipmentType",
    "provinceText" text,
    status public."ShipmentStatus" DEFAULT 'PENDING'::public."ShipmentStatus" NOT NULL,
    price numeric(10,2) NOT NULL,
    "customsTax" numeric(10,2),
    weight numeric(10,2),
    "freeWeight" numeric(10,2),
    "discountAmount" numeric(10,2),
    "collectedAmount" numeric(10,2),
    "offerCode" text,
    memo text,
    "trackingUrl" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Shipment" OWNER TO postgres;

--
-- Name: ShipmentProduct; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ShipmentProduct" (
    id text NOT NULL,
    "shipmentId" text NOT NULL,
    "productId" text NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    "unitPrice" numeric(10,2) NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."ShipmentProduct" OWNER TO postgres;

--
-- Name: ShippingType; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ShippingType" (
    id text NOT NULL,
    name text NOT NULL,
    code text NOT NULL,
    description text,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."ShippingType" OWNER TO postgres;

--
-- Name: SiteSettings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."SiteSettings" (
    id text NOT NULL,
    key text NOT NULL,
    value text NOT NULL,
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."SiteSettings" OWNER TO postgres;

--
-- Name: User; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."User" (
    id text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    name text,
    role public."Role" DEFAULT 'USER'::public."Role" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    permissions jsonb,
    "isActive" boolean DEFAULT true NOT NULL
);


ALTER TABLE public."User" OWNER TO postgres;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Data for Name: CargoCatalog; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."CargoCatalog" (id, name, code, description, "sortOrder", "createdAt", "updatedAt") FROM stdin;
cmqfft6ch000312ybgar0zflv	Miscelánea	MISCELANEA	\N	1	2026-06-15 16:38:18.977	2026-06-15 16:38:18.977
cmqfft6ch000412yb79n8bi3l	Duradero	DURADERO	\N	2	2026-06-15 16:38:18.977	2026-06-15 16:38:18.977
\.


--
-- Data for Name: Category; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Category" (id, name, slug, description, icon, "sortOrder", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Client; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Client" (id, name, email, phone, address, city, notes, "provinceId", "provinceText", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: FeatureCard; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."FeatureCard" (id, "imageUrl", "altText", title, description, "linkUrl", "sortOrder", "isActive", "createdAt", "updatedAt") FROM stdin;
37169b5c-ee6a-4750-85d3-59057e956033	/graphics/slide-1783456546364-7d2nij.png	1	RECOGIDA PUERTA A PUERTA	\N	\N	0	t	2026-07-07 20:31:12.145	2026-07-07 20:35:46.778
bbb3aeb5-09cc-4db8-b275-b85bfe455624	/graphics/slide-1783456341488-yuxsg9.png	2	CITAS DE LUNES A VIERNES 	\N	\N	1	t	2026-07-07 20:32:21.7	2026-07-07 20:35:46.778
\.


--
-- Data for Name: HeroSlide; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."HeroSlide" (id, "imageUrl", "altText", title, "linkUrl", "sortOrder", "isActive", "createdAt", "updatedAt") FROM stdin;
cmrb3qxls0004ljgk89vs2755	/graphics/slide-1783456156155-vxuhxe.png	1	\N	\N	0	t	2026-07-07 20:29:16.574	2026-07-07 20:29:16.574
cmrb3rbpm0005ljgkkjljs7ij	/graphics/slide-1783456174368-1fepkr.png	2	\N	\N	1	t	2026-07-07 20:29:34.859	2026-07-07 20:29:34.859
cmrb3sd330008ljgkas0dg5yo	/graphics/slide-1783456222952-c7p13n.png	5	\N	\N	4	t	2026-07-07 20:30:23.295	2026-07-07 20:30:23.295
cmrb3s27e0007ljgktjwq6h33	/graphics/slide-1783456638929-okf028.png	4	\N	\N	3	t	2026-07-07 20:30:09.195	2026-07-07 20:37:19.101
cmrb3rnm50006ljgk0xg8rl40	/graphics/slide-1783456749079-2aezkf.png	3	\N	\N	2	t	2026-07-07 20:29:50.285	2026-07-07 20:39:09.521
\.


--
-- Data for Name: OfficeImage; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."OfficeImage" (id, "imageUrl", "altText", title, description, "linkUrl", "sortOrder", "isActive", "createdAt", "updatedAt") FROM stdin;
9298e805-f790-4cf8-ba09-c07a1a0c2c40	/graphics/slide-1781570652792-zvdkui.jpeg	OFICINA	\N	\N	\N	0	t	2026-06-16 00:44:12.929	2026-06-16 00:44:12.929
72b38ad6-e762-444a-ac4c-65ba30430e04	/graphics/slide-1781570697178-a3ycm0.jpeg	OFICINA	\N	\N	\N	1	t	2026-06-16 00:44:57.483	2026-06-16 00:44:57.483
6b4db7de-14e4-4ec0-8b40-5de7175c26cd	/graphics/slide-1781570801147-to8a8r.jpeg	OFICINA	\N	\N	\N	2	t	2026-06-16 00:46:41.381	2026-06-16 00:46:41.381
fccc581a-b19c-48a7-ba81-1c7f0a2f0a2d	/graphics/slide-1781570884392-qxch4u.jpeg	OFICINA	\N	\N	\N	3	t	2026-06-16 00:48:04.557	2026-06-16 00:48:04.557
c6ac3951-b0cc-4dcd-be1d-9375b9cb95b2	/graphics/slide-1781570919454-wmwlan.jpeg	OFICINA	\N	\N	\N	4	t	2026-06-16 00:48:39.576	2026-06-16 00:48:39.576
0f218aa2-74f2-4e6e-a9ca-2c49691fe9c9	/graphics/slide-1781570940791-zbgsvg.jpeg	OFICINA	\N	\N	\N	5	t	2026-06-16 00:49:00.979	2026-06-16 00:49:00.979
5482738c-c493-4d8d-9083-5bad145f86fa	/graphics/slide-1781570963034-yskpwj.jpeg	OFICINA	\N	\N	\N	6	t	2026-06-16 00:49:23.195	2026-06-16 00:49:23.195
332333ad-8eac-4bdc-8109-2a2965744839	/graphics/slide-1781571010810-hgg1wk.jpeg	OFICINA	\N	\N	\N	7	t	2026-06-16 00:50:11.016	2026-06-16 00:50:11.016
\.


--
-- Data for Name: PaymentCatalog; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."PaymentCatalog" (id, name, code, description, "isActive", "sortOrder", "createdAt", "updatedAt") FROM stdin;
cmqfft6cx000j12yb5eyswtst	Cash	CASH	\N	t	1	2026-06-15 16:38:18.994	2026-06-15 16:38:18.994
cmqfft6cy000k12ybeydxco1s	Zelle	ZELLE	\N	t	2	2026-06-15 16:38:18.994	2026-06-15 16:38:18.994
cmqfft6cy000l12ybehb7c9xz	Tarjetas	TARJETAS	\N	t	3	2026-06-15 16:38:18.994	2026-06-15 16:38:18.994
cmqfft6cy000m12yb8hanu8vu	Transferencia	TRANSFERENCIA	\N	t	4	2026-06-15 16:38:18.994	2026-06-15 16:38:18.994
\.


--
-- Data for Name: Product; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Product" (id, name, slug, description, price, "costPrice", image, "spiceLevel", available, "sortOrder", content, "createdAt", "updatedAt", "categoryId") FROM stdin;
\.


--
-- Data for Name: PromotionCode; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."PromotionCode" (id, "promotionName", "publicCode", "tokenHash", status, "issuedByUserId", "issuedByEmail", "issuedTo", notes, "expiresAt", "redeemedByUserId", "redeemedByEmail", "redeemedAt", "cancelledByUserId", "cancelledByEmail", "cancelledAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: PromotionCodeAudit; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."PromotionCodeAudit" (id, "promotionCodeId", action, "performedByUserId", "performedByEmail", ip, "userAgent", message, "createdAt") FROM stdin;
\.


--
-- Data for Name: Province; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Province" (id, name, code, "sortOrder", "createdAt", "updatedAt") FROM stdin;
cmqfft6cm000512ybk1tsucde	Pinar del Río	PR	1	2026-06-15 16:38:18.983	2026-06-15 16:38:18.983
cmqfft6cm000612ybe9ivhdb9	Artemisa	AR	2	2026-06-15 16:38:18.983	2026-06-15 16:38:18.983
cmqfft6cn000712yb8bb9gxu7	La Habana	LH	3	2026-06-15 16:38:18.983	2026-06-15 16:38:18.983
cmqfft6cn000812yb8cqdbrin	Mayabeque	MJ	4	2026-06-15 16:38:18.983	2026-06-15 16:38:18.983
cmqfft6cn000912ybfm611ez1	Matanzas	MT	5	2026-06-15 16:38:18.983	2026-06-15 16:38:18.983
cmqfft6cn000a12ybec8bklk5	Cienfuegos	CF	6	2026-06-15 16:38:18.983	2026-06-15 16:38:18.983
cmqfft6cn000b12yb77n0hjp3	Villa Clara	VC	7	2026-06-15 16:38:18.983	2026-06-15 16:38:18.983
cmqfft6cn000c12yb76hz863f	San Antonio de los Baños	SB	8	2026-06-15 16:38:18.983	2026-06-15 16:38:18.983
cmqfft6cn000d12yb5c0mhv68	Camagüey	CM	9	2026-06-15 16:38:18.983	2026-06-15 16:38:18.983
cmqfft6co000e12ybj34wtigg	Las Tunas	LT	10	2026-06-15 16:38:18.983	2026-06-15 16:38:18.983
cmqfft6co000f12ybemv7jeo6	Holguín	HG	11	2026-06-15 16:38:18.983	2026-06-15 16:38:18.983
cmqfft6co000g12yb6u6rzkc2	Granma	GR	12	2026-06-15 16:38:18.983	2026-06-15 16:38:18.983
cmqfft6co000h12ybycp8ma86	Santiago de Cuba	SC	13	2026-06-15 16:38:18.983	2026-06-15 16:38:18.983
cmqfft6co000i12yb1ghirohs	Guantánamo	GT	14	2026-06-15 16:38:18.983	2026-06-15 16:38:18.983
\.


--
-- Data for Name: Shipment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Shipment" (id, hbl, "clientId", address, city, "shippingTypeId", "cargoTypeId", "provinceId", "paymentMethodId", type, "provinceText", status, price, "customsTax", weight, "freeWeight", "discountAmount", "collectedAmount", "offerCode", memo, "trackingUrl", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: ShipmentProduct; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ShipmentProduct" (id, "shipmentId", "productId", quantity, "unitPrice", "createdAt") FROM stdin;
\.


--
-- Data for Name: ShippingType; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ShippingType" (id, name, code, description, "sortOrder", "createdAt", "updatedAt") FROM stdin;
cmqfft6c2000012yb1w586z27	Marítimo	MARITIMO	\N	1	2026-06-15 16:38:18.962	2026-06-15 16:38:18.962
cmqfft6c2000112yb0bq00jv5	Aéreo	AEREO	\N	2	2026-06-15 16:38:18.962	2026-06-15 16:38:18.962
cmqfft6c2000212yb453n2tvp	Terrestre	TERRESTRE	\N	3	2026-06-15 16:38:18.962	2026-06-15 16:38:18.962
\.


--
-- Data for Name: SiteSettings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."SiteSettings" (id, key, value, "updatedAt") FROM stdin;
631233aa-b882-46e3-88f8-95dac1cae728	stickyCtaEnabled	true	2026-07-21 01:01:38.207
46c0f71e-7cfe-4f47-b8c6-2d435a15d40d	productDetailBreadcrumbEnabled	true	2026-07-21 01:01:38.207
0d88f2dc-77a2-4ef6-85d3-544203eb51f7	productDetailImageEnabled	true	2026-07-21 01:01:38.207
baf83b89-b027-4973-8f5d-9b6a15e8d7e3	productDetailRatingEnabled	true	2026-07-21 01:01:38.207
ceefb23d-c764-4ba2-805a-0f63c9420a64	productDetailDescriptionEnabled	true	2026-07-21 01:01:38.207
b3c5f14b-3abe-45ed-b2ad-9ca15fb9b21b	productDetailFeaturesEnabled	true	2026-07-21 01:01:38.207
c6848e47-3183-44f8-87a1-e09f17bff843	productDetailIncludesEnabled	true	2026-07-21 01:01:38.207
3f2376fc-ffe2-4297-abc9-c2ac4276e5f6	productDetailBoxContentEnabled	true	2026-07-21 01:01:38.207
064f12b9-e662-4ba4-9d53-c3deb77743f2	productDetailDeliveryEnabled	true	2026-07-21 01:01:38.207
53a6b30d-7656-4424-b68d-84a5748cf10b	productDetailTrackingEnabled	true	2026-07-21 01:01:38.207
5a46d854-070d-4689-b339-266d7ad92270	headerSectionEnabled	true	2026-07-21 01:01:38.207
a416e646-c479-4776-87f6-4f669f656b2e	heroSectionEnabled	true	2026-07-21 01:01:38.207
ae14a429-fac1-4ef3-ae65-df86c03d542e	heroSlidesEnabled	true	2026-07-21 01:01:38.207
57a23072-c39d-4e6f-af00-8cfbd8d94375	featureCardsEnabled	true	2026-07-21 01:01:38.207
5a5fca40-0659-4043-93a3-43b8ba5f40e7	officeGalleryEnabled	true	2026-07-21 01:01:38.207
c6c9c598-ebe2-4fb6-ad8d-ad183a1d01a5	menuSectionEnabled	false	2026-07-21 01:01:38.207
e149a547-34f9-485f-9e2e-d8254f294c25	locationSectionEnabled	true	2026-07-21 01:01:38.207
a27f76aa-1886-466b-971b-f2aa4930e29f	contactSectionEnabled	true	2026-07-21 01:01:38.207
2ec885d7-9712-414f-83db-407df93e13c8	footerSectionEnabled	true	2026-07-21 01:01:38.207
a0ed389c-d74e-4c92-ba79-4c8d08eab71f	landingContent	{"business":{"brandName":"","brandTagline":"","cityLabel":"Orlando","address":"4913 S Orange ave Orlando FL 32806","phoneDisplay":"+1 (407) 639-4011","whatsappUrl":"https://wa.me/14076394011","email":"info@dlaenvios.com","trackingUrl":"https://www.solvebigtech.com/solvedc/tracking/dayready/","mapUrl":"https://share.google/6E5rfOKnE4ZSqUA36","facebookUrl":"https://www.facebook.com/share/17so3zSUeL/?mibextid=wwXIfr","instagramUrl":"https://www.instagram.com/dlaviajesyenvios?igsh=MWZzeWRmaTljYTYyZg==&utm_source=ig_contact_invite","tiktokUrl":"https://www.tiktok.com/@dla.viajes.y.envi?_r=1&_t=ZP-93ff0dcsaTu","logoUrl":"/graphics/slide-1784595046082-v2rfg8.png","logoAlt":"DLA Viajes y Envios","headerLogoHeightMobile":"72","headerLogoHeightDesktop":"101","footerLogoHeight":"45","supportImageUrl":"/graphics/slide-1784558764852-7ekwtj.png","supportImageAlt":"Camion de DLA","supportImageCompactHeight":"40","supportImageFeaturedHeight":"150"},"header":{"trackingButtonText":"Rastrear envío","loginButtonText":"Iniciar Sesión","loginUrl":"/login","navButtons":[{"id":"header-nav-shipments","text":"Envíos","url":"#menu","isVisible":false,"position":1},{"id":"header-nav-boxes","text":"Cajas Super Express","url":"#menu","isVisible":false,"position":2},{"id":"header-nav-electronics","text":"Electronicos","url":"#menu","isVisible":false,"position":3}]},"hero":{"titlePrimary":"DLA","titleSecondary":"Viajes y Envíos","subtitle":"Donde conectamos con tu destino","scheduleTitle":"De Lunes a Sábado","weekSchedule":"Lunes a Viernes: 10:00 a.m. - 6:00 p.m.","saturdaySchedule":"Sábados: 10:00 a.m. - 2:00 p.m.","fallbackImageUrl":"/graphics/slide1.svg","fallbackImageAlt":"Imagen principal de DLA","addressPrefix":"En","imageHeightMobile":"400","imageHeightDesktop":"600"},"featureCards":{"badgeText":"Ofertas de servicio","titleLine1":"Descubre Nuestros","titleLine2":"Servicios","iconName":"Car","ctaText":"Ver todas las ofertas","ctaUrl":"#menu"},"officeGallery":{"badgeText":"Nuestras oficinas","title":"Conoce Nuestros Espacios","iconName":"Building2"},"about":{"badgeText":"Conoce DLA","sectionTitle":"¿Quiénes Somos?","subtitle":"En DLA Viajes y Envíos acercamos a las familias con un servicio confiable, responsable y cercano para cada envío a Cuba.","introTitle":"Envíos con cuidado, transparencia y confianza","introParagraph1":"En DLA Viajes y Envíos somos una empresa dedicada a brindar un servicio confiable de envíos a Cuba, comprometida con acercar a las familias a través de una atención responsable, personalizada y de calidad.","introParagraph2":"Entendemos que cada paquete representa mucho más que un envío; representa apoyo, cariño y la tranquilidad de quienes desean ayudar a sus seres queridos. Por eso trabajamos con transparencia, responsabilidad y un firme compromiso de ofrecer un servicio seguro y eficiente en cada entrega.","introParagraph3":"Nuestro objetivo es convertirnos en la opción de confianza para quienes necesitan enviar a Cuba con la seguridad de que sus envíos serán tratados con el cuidado que merecen.","visionTitle":"Nuestra Visión","visionDescription":"Ser la empresa de mayor confianza en el servicio de envíos a Cuba, reconocida por nuestra excelencia, responsabilidad y atención personalizada. Aspiramos a crecer continuamente, incorporando nuevas soluciones que hagan cada envío más rápido, seguro y accesible para nuestros clientes.","missionTitle":"Nuestra Misión","missionDescription":"Brindar un servicio de envíos a Cuba seguro, eficiente y transparente, ofreciendo atención personalizada y acompañamiento durante todo el proceso. Trabajamos con compromiso y responsabilidad para que cada cliente tenga la tranquilidad de que sus envíos llegarán a su destino con el cuidado y la confianza que nos distinguen.","valuesBadgeText":"Lo que nos define","valuesTitle":"Nuestros Valores","valuesSubtitle":"Cada envío que gestionamos sigue los mismos principios de responsabilidad, cercanía y excelencia.","commitmentTitle":"Compromiso","commitmentDescription":"Cumplimos lo que prometemos y damos seguimiento a cada envío.","responsibilityTitle":"Responsabilidad","responsibilityDescription":"Tratamos cada paquete con el cuidado y la importancia que merece.","trustTitle":"Confianza","trustDescription":"Actuamos con honestidad y transparencia en cada servicio.","qualityTitle":"Calidad","qualityDescription":"Buscamos la excelencia en la atención y en cada proceso.","respectTitle":"Respeto","respectDescription":"Valoramos a cada cliente y ofrecemos un trato amable y profesional.","personalizedAttentionTitle":"Atención Personalizada","personalizedAttentionDescription":"Escuchamos las necesidades de nuestros clientes para brindar la mejor solución."},"menu":{"title":"Nuestras ofertas","allCategoryLabel":"Todos","categorySelectLabel":"Categoría","categorySelectPlaceholder":"Selecciona una categoría","allCategoryIconName":"BoxIcon","defaultCategoryIconName":"BoxIcon","errorText":"Error al cargar productos:","emptyAllText":"No hay productos disponibles","emptyCategoryText":"No hay productos disponibles en esta categoría"},"location":{"sectionTitle":"ORLANDO","subtitle":"Un espacio diseñado para recibir tus envíos con seguridad, confianza y atención personalizada.","cityTitle":"Orlando","visitTitle":"De Lunes a Sabado!","scheduleTitle":"Horario","scheduleDescription":"Te esperamos para brindarte un servicio rápido, seguro y con la atención personalizada que mereces.","weekSchedule":"Lunes a Viernes: 10:00 a.m. - 6:00 p.m.","saturdaySchedule":"Sabados: 10:00 a.m. - 2:00 p.m.","appointmentNote":"Para su mayor comodidad, ofrecemos atencion fuera de horario con cita previa hasta las 9:00","bannerTitle":"Recogemos su paquete en la puerta de su casa","bannerDescription":"Obtenga servicio de recogida para sus envios y disfrute de la comodidad de enviar desde su hogar.","mapImageUrl":"/placeholder.svg","mapImageAlt":"Mapa de ubicacion","mapImageHeightMobile":"320","mapImageHeightDesktop":"560","mapLinkLabel":"Abrir mapa","visitIconName":"Calendar","scheduleIconName":"Clock"},"contact":{"sectionTitle":"Contactanos","subtitle":"Tienes alguna pregunta o quieres contratarnos para un viaje o envio? Contactanos.","phoneLabel":"Telefono","phoneHelp":"Llamanos directamente","emailLabel":"E-Mail","emailHelp":"Escribenos un correo electronico","whatsappLabel":"WhatsApp","whatsappHelp":"Escribenos por WhatsApp","phoneIconName":"Phone","emailIconName":"Mail","whatsappIconName":"Whatsapp"},"footer":{"linksTitle":"LINKS","menuLinkText":"Nuestras ofertas","menuLinkUrl":"#menu","locationLinkText":"Ubicacion","locationLinkUrl":"#location","contactLinkText":"Contactenos","contactLinkUrl":"#contact","contactTitle":"Contactenos","transportBadgeText":"Transporte seguro","rightsText":"Todos los derechos reservados.","privacyLinkText":"Politica de privacidad","privacyLinkUrl":"/datenschutz","termsLinkText":"Terminos y condiciones","termsLinkUrl":"/agb"},"stickyCta":{"findUsText":"Encuentranos en","buttonText":"WhatsApp","buttonUrl":"https://wa.me/14076394011"},"seo":{"siteUrl":"https://dlaenvios.com","canonicalUrl":"https://dlaenvios.com","siteName":"DLA Viajes y Envios","defaultTitle":"DLA Viajes y Envios","titleTemplate":"%s | DLA Viajes y Envios","description":"DLA Viajes y Envios. Agencia de viajes, envios y servicios en Orlando.","keywords":"dla envios, viajes, envios, orlando, agencia de viajes, paqueteria","locale":"es_US","siteLanguage":"es","themeColor":"#1a1a1a","ogImageUrl":"/graphics/slide1.svg","ogImageAlt":"DLA Viajes y Envios","twitterImageUrl":"/graphics/slide1.svg","faviconUrl":"/graphics/slide-1784514530067-l3lbux.svg","shortcutIconUrl":"/graphics/slide-1784514530527-d5ktus.svg","appleIconUrl":"/graphics/slide-1784514531354-mw3qaq.svg","manifestUrl":"/site.webmanifest","structuredDataJson":"{\\n  \\"@context\\": \\"https://schema.org\\",\\n  \\"@graph\\": [\\n    {\\n      \\"@type\\": \\"Organization\\",\\n      \\"@id\\": \\"https://dlaenvios.com/#organization\\",\\n      \\"name\\": \\"DLA Viajes y envios\\",\\n      \\"url\\": \\"https://dlaenvios.com\\",\\n      \\"logo\\": \\"https://dlaenvios.com/graphics/logo.svg\\",\\n      \\"email\\": \\"info@dlaenvios.com\\",\\n      \\"telephone\\": \\"+1 (407) 639-4011\\",\\n      \\"sameAs\\": [\\n        \\"https://www.facebook.com/share/17so3zSUeL/?mibextid=wwXIfr\\",\\n        \\"https://www.instagram.com/dlaviajesyenvios?igsh=MWZzeWRmaTljYTYyZg==&utm_source=ig_contact_invite\\",\\n        \\"https://www.tiktok.com/@dla.viajes.y.envi?_r=1&_t=ZP-93ff0dcsaTu\\"\\n      ]\\n    },\\n    {\\n      \\"@type\\": \\"LocalBusiness\\",\\n      \\"@id\\": \\"https://dlaenvios.com/#localbusiness\\",\\n      \\"name\\": \\"DLA Viajes y envios\\",\\n      \\"description\\": \\"Agencia de viajes y envios en Orlando, Florida.\\",\\n      \\"url\\": \\"https://dlaenvios.com\\",\\n      \\"image\\": \\"https://dlaenvios.com/graphics/slide1.svg\\",\\n      \\"address\\": {\\n        \\"@type\\": \\"PostalAddress\\",\\n        \\"streetAddress\\": \\"4913 S Orange ave\\",\\n        \\"addressLocality\\": \\"Orlando\\",\\n        \\"addressRegion\\": \\"FL\\",\\n        \\"postalCode\\": \\"32806\\",\\n        \\"addressCountry\\": \\"US\\"\\n      },\\n      \\"contactPoint\\": [\\n        {\\n          \\"@type\\": \\"ContactPoint\\",\\n          \\"telephone\\": \\"+1 (407) 639-4011\\",\\n          \\"contactType\\": \\"customer support\\",\\n          \\"email\\": \\"info@dlaenvios.com\\"\\n        }\\n      ]\\n    },\\n    {\\n      \\"@type\\": \\"WebSite\\",\\n      \\"@id\\": \\"https://dlaenvios.com/#website\\",\\n      \\"url\\": \\"https://dlaenvios.com\\",\\n      \\"name\\": \\"DLA Viajes y envios\\",\\n      \\"description\\": \\"Sitio oficial de DLA Viajes y envios.\\",\\n      \\"inLanguage\\": \\"es\\"\\n    }\\n  ]\\n}"}}	2026-08-11 10:36:22.523
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."User" (id, email, password, name, role, "createdAt", "updatedAt", permissions, "isActive") FROM stdin;
cmqffizad000085izfqfabhyj	admin@dlaenvios.com	$2b$10$6ZxAOr2BEWTXXvEZSFAxKuw77jWjI1C5RvVUlHjgbSIXhgZ0lQn3u	Admin	ADMIN	2026-06-15 16:30:23.269	2026-06-15 16:30:23.269	\N	t
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
a0d98d07-79ad-4121-aa56-ee6a3d73da87	2bf8655534fa432466f539ac680c9b331617b0a625beecaf4061aa4cb79b375c	2026-06-15 16:30:14.108554+00	20260201165311_init	\N	\N	2026-06-15 16:30:14.102059+00	1
1ea105f2-2834-4c74-b0e1-2f10d04b7dbd	477bc844c27b893be7e36ecb2abc7144ea84d698f67eb75cf58bed3710df64d7	2026-06-15 16:30:14.116539+00	202602020209_remove_client_fields_from_shipment	\N	\N	2026-06-15 16:30:14.111008+00	1
c2643943-b98f-4691-bcd5-fce035be5884	83a8f7996f7d8735a40c24a7674f71f83a2681d4197a1213e8fd4e40ad65a5d7	2026-06-15 16:30:14.124579+00	202602020220_add_shipment_products_relation	\N	\N	2026-06-15 16:30:14.118937+00	1
2cf68168-c32d-4158-a957-f902895dd5f7	c50dad1cf600476c4c18f70cc70023d4c3a1d14caa01273dc47f1d4e95c42a8d	2026-06-15 16:30:14.266773+00	20260209165729_init	\N	\N	2026-06-15 16:30:14.126703+00	1
84c9c0ac-c531-430a-8b1d-cca035e8b571	b2c6d0ee5b9907b957d73cd00b875c9ecfc3c0a914ecf2ec125ca32c26a8455e	2026-06-15 16:30:14.274681+00	20260312103000_add_user_permissions_and_active	\N	\N	2026-06-15 16:30:14.269425+00	1
\.


--
-- Name: CargoCatalog CargoCatalog_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CargoCatalog"
    ADD CONSTRAINT "CargoCatalog_pkey" PRIMARY KEY (id);


--
-- Name: Category Category_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Category"
    ADD CONSTRAINT "Category_pkey" PRIMARY KEY (id);


--
-- Name: Client Client_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Client"
    ADD CONSTRAINT "Client_pkey" PRIMARY KEY (id);


--
-- Name: FeatureCard FeatureCard_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."FeatureCard"
    ADD CONSTRAINT "FeatureCard_pkey" PRIMARY KEY (id);


--
-- Name: HeroSlide HeroSlide_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."HeroSlide"
    ADD CONSTRAINT "HeroSlide_pkey" PRIMARY KEY (id);


--
-- Name: OfficeImage OfficeImage_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OfficeImage"
    ADD CONSTRAINT "OfficeImage_pkey" PRIMARY KEY (id);


--
-- Name: PaymentCatalog PaymentCatalog_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PaymentCatalog"
    ADD CONSTRAINT "PaymentCatalog_pkey" PRIMARY KEY (id);


--
-- Name: Product Product_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_pkey" PRIMARY KEY (id);


--
-- Name: PromotionCodeAudit PromotionCodeAudit_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PromotionCodeAudit"
    ADD CONSTRAINT "PromotionCodeAudit_pkey" PRIMARY KEY (id);


--
-- Name: PromotionCode PromotionCode_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PromotionCode"
    ADD CONSTRAINT "PromotionCode_pkey" PRIMARY KEY (id);


--
-- Name: PromotionCode PromotionCode_publicCode_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PromotionCode"
    ADD CONSTRAINT "PromotionCode_publicCode_key" UNIQUE ("publicCode");


--
-- Name: PromotionCode PromotionCode_tokenHash_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PromotionCode"
    ADD CONSTRAINT "PromotionCode_tokenHash_key" UNIQUE ("tokenHash");


--
-- Name: Province Province_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Province"
    ADD CONSTRAINT "Province_pkey" PRIMARY KEY (id);


--
-- Name: ShipmentProduct ShipmentProduct_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ShipmentProduct"
    ADD CONSTRAINT "ShipmentProduct_pkey" PRIMARY KEY (id);


--
-- Name: Shipment Shipment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Shipment"
    ADD CONSTRAINT "Shipment_pkey" PRIMARY KEY (id);


--
-- Name: ShippingType ShippingType_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ShippingType"
    ADD CONSTRAINT "ShippingType_pkey" PRIMARY KEY (id);


--
-- Name: SiteSettings SiteSettings_key_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SiteSettings"
    ADD CONSTRAINT "SiteSettings_key_key" UNIQUE (key);


--
-- Name: SiteSettings SiteSettings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SiteSettings"
    ADD CONSTRAINT "SiteSettings_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: CargoCatalog_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "CargoCatalog_code_key" ON public."CargoCatalog" USING btree (code);


--
-- Name: Category_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Category_slug_key" ON public."Category" USING btree (slug);


--
-- Name: Client_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Client_email_key" ON public."Client" USING btree (email);


--
-- Name: PaymentCatalog_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "PaymentCatalog_code_key" ON public."PaymentCatalog" USING btree (code);


--
-- Name: Product_categoryId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Product_categoryId_idx" ON public."Product" USING btree ("categoryId");


--
-- Name: Product_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Product_slug_key" ON public."Product" USING btree (slug);


--
-- Name: PromotionCodeAudit_action_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "PromotionCodeAudit_action_idx" ON public."PromotionCodeAudit" USING btree (action);


--
-- Name: PromotionCodeAudit_promotionCodeId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "PromotionCodeAudit_promotionCodeId_idx" ON public."PromotionCodeAudit" USING btree ("promotionCodeId");


--
-- Name: PromotionCode_publicCode_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "PromotionCode_publicCode_idx" ON public."PromotionCode" USING btree ("publicCode");


--
-- Name: PromotionCode_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "PromotionCode_status_idx" ON public."PromotionCode" USING btree (status);


--
-- Name: Province_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Province_name_key" ON public."Province" USING btree (name);


--
-- Name: ShipmentProduct_productId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ShipmentProduct_productId_idx" ON public."ShipmentProduct" USING btree ("productId");


--
-- Name: ShipmentProduct_shipmentId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ShipmentProduct_shipmentId_idx" ON public."ShipmentProduct" USING btree ("shipmentId");


--
-- Name: Shipment_hbl_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Shipment_hbl_key" ON public."Shipment" USING btree (hbl);


--
-- Name: ShippingType_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "ShippingType_code_key" ON public."ShippingType" USING btree (code);


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: Client Client_provinceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Client"
    ADD CONSTRAINT "Client_provinceId_fkey" FOREIGN KEY ("provinceId") REFERENCES public."Province"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Product Product_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public."Category"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ShipmentProduct ShipmentProduct_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ShipmentProduct"
    ADD CONSTRAINT "ShipmentProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ShipmentProduct ShipmentProduct_shipmentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ShipmentProduct"
    ADD CONSTRAINT "ShipmentProduct_shipmentId_fkey" FOREIGN KEY ("shipmentId") REFERENCES public."Shipment"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Shipment Shipment_cargoTypeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Shipment"
    ADD CONSTRAINT "Shipment_cargoTypeId_fkey" FOREIGN KEY ("cargoTypeId") REFERENCES public."CargoCatalog"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Shipment Shipment_clientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Shipment"
    ADD CONSTRAINT "Shipment_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES public."Client"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Shipment Shipment_paymentMethodId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Shipment"
    ADD CONSTRAINT "Shipment_paymentMethodId_fkey" FOREIGN KEY ("paymentMethodId") REFERENCES public."PaymentCatalog"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Shipment Shipment_provinceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Shipment"
    ADD CONSTRAINT "Shipment_provinceId_fkey" FOREIGN KEY ("provinceId") REFERENCES public."Province"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Shipment Shipment_shippingTypeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Shipment"
    ADD CONSTRAINT "Shipment_shippingTypeId_fkey" FOREIGN KEY ("shippingTypeId") REFERENCES public."ShippingType"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

\unrestrict e5IwHRx1mYhomeEXIQUdHr998c4Kh6RsHVWMKtKWXfLB0my37xzcBIdLeBAMzw0

