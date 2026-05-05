--
-- PostgreSQL database dump
--

\restrict PEQpuM4x23bYtlgiS89KTD6IXelutgFoM2nNw8zwxVU0BI6gm2H1HpAT5BeodTK

-- Dumped from database version 18.3
-- Dumped by pg_dump version 18.3

-- Started on 2026-05-04 14:42:25

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 232 (class 1259 OID 41202)
-- Name: badge; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.badge (
    id uuid NOT NULL,
    name character varying NOT NULL,
    description character varying NOT NULL,
    icon character varying
);


ALTER TABLE public.badge OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 41097)
-- Name: enrollment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.enrollment (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    subject_id uuid NOT NULL,
    enrolled_at timestamp without time zone NOT NULL,
    is_active boolean NOT NULL
);


ALTER TABLE public.enrollment OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 40977)
-- Name: level; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.level (
    id uuid NOT NULL,
    name character varying NOT NULL
);


ALTER TABLE public.level OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 41020)
-- Name: paper; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.paper (
    id uuid NOT NULL,
    subject_id uuid NOT NULL,
    year integer NOT NULL,
    paper_type character varying NOT NULL
);


ALTER TABLE public.paper OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 41119)
-- Name: paper_progress; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.paper_progress (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    paper_id uuid NOT NULL,
    status character varying NOT NULL,
    last_accessed timestamp without time zone NOT NULL,
    completed_at timestamp without time zone
);


ALTER TABLE public.paper_progress OWNER TO postgres;

--
-- TOC entry 234 (class 1259 OID 41234)
-- Name: password_reset_token; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.password_reset_token (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    token character varying NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    used boolean NOT NULL,
    created_at timestamp without time zone NOT NULL
);


ALTER TABLE public.password_reset_token OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 41080)
-- Name: pdf; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pdf (
    id uuid NOT NULL,
    paper_id uuid NOT NULL,
    file_url character varying NOT NULL,
    pdf_type character varying NOT NULL,
    created_at timestamp without time zone NOT NULL
);


ALTER TABLE public.pdf OWNER TO postgres;

--
-- TOC entry 230 (class 1259 OID 41166)
-- Name: pdf_download; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pdf_download (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    pdf_id uuid NOT NULL,
    downloaded_at timestamp without time zone NOT NULL
);


ALTER TABLE public.pdf_download OWNER TO postgres;

--
-- TOC entry 233 (class 1259 OID 41214)
-- Name: refresh_token; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.refresh_token (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    token character varying NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    revoked boolean NOT NULL,
    created_at timestamp without time zone NOT NULL
);


ALTER TABLE public.refresh_token OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 41036)
-- Name: reply; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reply (
    id uuid NOT NULL,
    thread_id uuid NOT NULL,
    author_id uuid NOT NULL,
    content character varying NOT NULL,
    created_at timestamp without time zone NOT NULL
);


ALTER TABLE public.reply OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 41187)
-- Name: streak; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.streak (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    current_streak integer NOT NULL,
    longest_streak integer NOT NULL,
    last_activity_date timestamp without time zone
);


ALTER TABLE public.streak OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 40988)
-- Name: subject; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subject (
    id uuid NOT NULL,
    name character varying NOT NULL,
    level_id uuid NOT NULL
);


ALTER TABLE public.subject OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 41003)
-- Name: thread; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.thread (
    id uuid NOT NULL,
    title character varying NOT NULL,
    category character varying NOT NULL,
    author_id uuid NOT NULL,
    created_at timestamp without time zone NOT NULL
);


ALTER TABLE public.thread OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 40961)
-- Name: user; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."user" (
    full_name character varying NOT NULL,
    email character varying NOT NULL,
    whatsapp_number character varying,
    role character varying NOT NULL,
    level character varying,
    is_active boolean NOT NULL,
    id uuid NOT NULL,
    password_hash character varying NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


ALTER TABLE public."user" OWNER TO postgres;

--
-- TOC entry 235 (class 1259 OID 41254)
-- Name: user_badge; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_badge (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    badge_id uuid NOT NULL,
    earned_at timestamp without time zone NOT NULL
);


ALTER TABLE public.user_badge OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 41058)
-- Name: video; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.video (
    id uuid NOT NULL,
    paper_id uuid NOT NULL,
    creator_id uuid NOT NULL,
    youtube_id character varying NOT NULL,
    timestamps character varying,
    created_at timestamp without time zone NOT NULL
);


ALTER TABLE public.video OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 41143)
-- Name: video_watch; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.video_watch (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    video_id uuid NOT NULL,
    watched_seconds integer NOT NULL,
    is_completed boolean NOT NULL,
    last_watched_at timestamp without time zone NOT NULL
);


ALTER TABLE public.video_watch OWNER TO postgres;

--
-- TOC entry 5107 (class 0 OID 41202)
-- Dependencies: 232
-- Data for Name: badge; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.badge (id, name, description, icon) FROM stdin;
ac835cfc-1409-4a2b-8afc-3e2277d6c441	First Step	Completed your first paper	🎯
1b3e27c9-89b6-4660-9539-2b5191e54c89	Week Warrior	Maintained a 7-day streak	🔥
31aab0a3-7151-4e2f-a2cd-fbe2dd56c1b5	Subject Master	Completed all papers in a subject	📚
b38da2c2-7787-4d12-8761-354f8d05db8b	Quick Starter	Enrolled in 3 subjects	🚀
\.


--
-- TOC entry 5102 (class 0 OID 41097)
-- Dependencies: 227
-- Data for Name: enrollment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.enrollment (id, user_id, subject_id, enrolled_at, is_active) FROM stdin;
6ccb4413-dd6d-4a53-a555-769ef67ace33	76c169ae-3c94-4237-a897-dc2833167afc	9cf3a7b9-a3e6-46aa-9c99-6d32664d95df	2026-05-03 20:50:43.812027	t
47a9360c-af05-4d97-95a6-d45ba232ac97	76c169ae-3c94-4237-a897-dc2833167afc	e73391f0-69fd-460a-910c-675660f77062	2026-05-03 20:50:43.820771	t
eca63871-e4f1-48b4-9f5f-9c373f34d9e9	76c169ae-3c94-4237-a897-dc2833167afc	370a03fd-1904-49dc-9594-d1bbef031982	2026-05-03 20:50:43.825642	t
c278f9db-0253-4bed-98e5-0ceabb8d7b2c	182f8a59-30bb-4831-8a0b-d0e39bbbe7fa	45fbaf17-3e92-4d5f-a9cd-d134907f5401	2026-05-03 20:50:43.831738	t
5d8c53b0-0e38-4230-a559-6cf525adcb17	182f8a59-30bb-4831-8a0b-d0e39bbbe7fa	24044594-dda4-4200-97e3-3cc0a5a80286	2026-05-03 20:50:43.836387	t
80cd3840-7f31-4ad7-8404-2c8793f2bd31	182f8a59-30bb-4831-8a0b-d0e39bbbe7fa	9a2922b9-df65-4b35-93ae-3d42a3911f89	2026-05-03 20:50:43.839979	t
\.


--
-- TOC entry 5095 (class 0 OID 40977)
-- Dependencies: 220
-- Data for Name: level; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.level (id, name) FROM stdin;
8066be00-1bf5-4d2c-a9ae-1326d37cc24d	O-Level
82ab5353-20d6-4b23-ba60-066a486f24dd	A-Level
\.


--
-- TOC entry 5098 (class 0 OID 41020)
-- Dependencies: 223
-- Data for Name: paper; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.paper (id, subject_id, year, paper_type) FROM stdin;
265ff9eb-911a-44b6-be5d-1fed7a023f36	14565984-20ac-48b3-aa58-0cdc42c26f1a	2026	Paper 1
61300eba-2067-4e47-89a8-0bf958c3b725	14565984-20ac-48b3-aa58-0cdc42c26f1a	2026	Paper 2
\.


--
-- TOC entry 5103 (class 0 OID 41119)
-- Dependencies: 228
-- Data for Name: paper_progress; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.paper_progress (id, user_id, paper_id, status, last_accessed, completed_at) FROM stdin;
\.


--
-- TOC entry 5109 (class 0 OID 41234)
-- Dependencies: 234
-- Data for Name: password_reset_token; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.password_reset_token (id, user_id, token, expires_at, used, created_at) FROM stdin;
\.


--
-- TOC entry 5101 (class 0 OID 41080)
-- Dependencies: 226
-- Data for Name: pdf; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pdf (id, paper_id, file_url, pdf_type, created_at) FROM stdin;
b58ba941-a3ee-4c75-b500-106abde009ea	265ff9eb-911a-44b6-be5d-1fed7a023f36	https://youtube.com/shorts/EKNDPb4qHLA?si=yYuSZGI7t92qEtIG	question	2026-05-03 22:16:15.908017
d1cb6320-e392-45fc-92d6-aa1dc88e4485	265ff9eb-911a-44b6-be5d-1fed7a023f36	http://localhost:8000/uploads/1777851209_Engineering_Economics_Mock_Exam_With_Solutions.pdf	question	2026-05-03 23:33:40.523226
4ea0b89f-0925-473f-8a1b-0b567c2929db	265ff9eb-911a-44b6-be5d-1fed7a023f36	http://localhost:8000/uploads/1777851217_QUESTIONNAIRE_SAMPLE_PDF.pdf	answer	2026-05-03 23:33:41.179082
\.


--
-- TOC entry 5105 (class 0 OID 41166)
-- Dependencies: 230
-- Data for Name: pdf_download; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pdf_download (id, user_id, pdf_id, downloaded_at) FROM stdin;
\.


--
-- TOC entry 5108 (class 0 OID 41214)
-- Dependencies: 233
-- Data for Name: refresh_token; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.refresh_token (id, user_id, token, expires_at, revoked, created_at) FROM stdin;
\.


--
-- TOC entry 5099 (class 0 OID 41036)
-- Dependencies: 224
-- Data for Name: reply; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reply (id, thread_id, author_id, content, created_at) FROM stdin;
\.


--
-- TOC entry 5106 (class 0 OID 41187)
-- Dependencies: 231
-- Data for Name: streak; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.streak (id, user_id, current_streak, longest_streak, last_activity_date) FROM stdin;
53d8f6f6-e08f-4e68-91b6-38400fbef34e	76c169ae-3c94-4237-a897-dc2833167afc	5	5	2026-05-03 20:50:43.849355
cd3fdce9-b2eb-4682-9287-9b94af2229e5	182f8a59-30bb-4831-8a0b-d0e39bbbe7fa	12	12	2026-05-03 20:50:43.856251
\.


--
-- TOC entry 5096 (class 0 OID 40988)
-- Dependencies: 221
-- Data for Name: subject; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subject (id, name, level_id) FROM stdin;
9cf3a7b9-a3e6-46aa-9c99-6d32664d95df	Mathematics	8066be00-1bf5-4d2c-a9ae-1326d37cc24d
14565984-20ac-48b3-aa58-0cdc42c26f1a	English	8066be00-1bf5-4d2c-a9ae-1326d37cc24d
370a03fd-1904-49dc-9594-d1bbef031982	Biology	8066be00-1bf5-4d2c-a9ae-1326d37cc24d
5d4e2754-62c7-464d-bdf3-654722beef08	Physics	8066be00-1bf5-4d2c-a9ae-1326d37cc24d
d07ebe6b-5c4b-499c-a961-a72263d6f7b8	Chemistry	8066be00-1bf5-4d2c-a9ae-1326d37cc24d
55b25cd4-cb7e-42d3-bf48-ccfa07ea32d0	Pure Maths with Statistics	82ab5353-20d6-4b23-ba60-066a486f24dd
24044594-dda4-4200-97e3-3cc0a5a80286	Physics	82ab5353-20d6-4b23-ba60-066a486f24dd
9a2922b9-df65-4b35-93ae-3d42a3911f89	Chemistry	82ab5353-20d6-4b23-ba60-066a486f24dd
67caea84-2050-471e-b0c9-9597905687c0	Biology	82ab5353-20d6-4b23-ba60-066a486f24dd
87f80f72-9713-4e14-a55e-093837b0bbba	Economics	82ab5353-20d6-4b23-ba60-066a486f24dd
e73391f0-69fd-460a-910c-675660f77062	English Language	8066be00-1bf5-4d2c-a9ae-1326d37cc24d
d8c6fdb1-0b34-4738-8162-240cb3f76955	Geography	8066be00-1bf5-4d2c-a9ae-1326d37cc24d
bf36684b-4ba8-4f09-93c9-16c5c0fb8dc9	History	8066be00-1bf5-4d2c-a9ae-1326d37cc24d
5f449dc8-2d76-41fc-9738-a3399056db25	Computer Science	8066be00-1bf5-4d2c-a9ae-1326d37cc24d
f0ad55b6-cfb9-4283-b269-1e44be5c3ab4	Economics	8066be00-1bf5-4d2c-a9ae-1326d37cc24d
600994c3-90ac-43d3-a367-74126c2ef464	French	8066be00-1bf5-4d2c-a9ae-1326d37cc24d
45fbaf17-3e92-4d5f-a9cd-d134907f5401	Pure Mathematics with Statistics	82ab5353-20d6-4b23-ba60-066a486f24dd
d52d90cf-539d-430a-a53b-8cba796a39cf	Computer Science	82ab5353-20d6-4b23-ba60-066a486f24dd
6c86cd66-5267-4c50-bad7-32521b59c1ce	Literature in English	82ab5353-20d6-4b23-ba60-066a486f24dd
3ddae40b-a07b-4980-897f-e7d537450c3f	Further Mathematics	82ab5353-20d6-4b23-ba60-066a486f24dd
6b6252a7-2f73-4952-92fb-25db983ec10d	Pure Maths With Mechanics	82ab5353-20d6-4b23-ba60-066a486f24dd
\.


--
-- TOC entry 5097 (class 0 OID 41003)
-- Dependencies: 222
-- Data for Name: thread; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.thread (id, title, category, author_id, created_at) FROM stdin;
\.


--
-- TOC entry 5094 (class 0 OID 40961)
-- Dependencies: 219
-- Data for Name: user; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."user" (full_name, email, whatsapp_number, role, level, is_active, id, password_hash, created_at, updated_at) FROM stdin;
Super Admin	admin@firstchoice.cm	\N	admin	\N	t	f6efe03f-080e-4545-ba1c-839667dcd390	$2b$12$sBiKIeLD/ct4BXNqewqXtuFK4uJZnSnBBr9aDqATkaySbu/IA8Rl.	2026-05-03 20:42:29.088564	2026-05-03 20:42:29.088828
Amara Nkeng	amara@test.cm	+237655001001	student	O-Level	t	76c169ae-3c94-4237-a897-dc2833167afc	$2b$12$zNqEysh1e0XhMuOdVo.pbOe55j6PwFZsSqC9e9lpxXeoNp9lxgG9y	2026-05-03 20:50:42.980003	2026-05-03 20:50:42.980291
Brice Fotso	brice@test.cm	+237655002002	student	A-Level	t	182f8a59-30bb-4831-8a0b-d0e39bbbe7fa	$2b$12$2UpZzQWgNlnKIhl8CM.6puW8YhI8oqHsaPkhzH0qhfDfkNM/9nopO	2026-05-03 20:50:43.788198	2026-05-03 20:50:43.788563
boss Fopah	bossfopah@gmail.com	\N	student	\N	t	eebbfc4c-a465-4977-9510-7a70bffa4c09	$2b$12$173bn/sZpm22PgTil7cD2OU6wOQjj8hn/woB1eJVw7ZuNlxX9OkS.	2026-05-03 22:48:46.04915	2026-05-03 22:48:46.049498
Fopah Princely	fopahprincely01@gmail.com	\N	student	\N	t	225bdcac-df74-42a1-90cc-05288d9d0fd8	$2b$12$RRVcgnQy9sAhxZJj22N.W.05BUsGkrdH3Z1U3T192UYBPxCms3q/y	2026-05-03 23:34:40.609725	2026-05-03 23:34:40.609947
\.


--
-- TOC entry 5110 (class 0 OID 41254)
-- Dependencies: 235
-- Data for Name: user_badge; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_badge (id, user_id, badge_id, earned_at) FROM stdin;
fac38e47-7fd9-472a-b04a-aa9c50ec44b6	76c169ae-3c94-4237-a897-dc2833167afc	ac835cfc-1409-4a2b-8afc-3e2277d6c441	2026-05-03 20:50:43.868544
01c4848f-f977-42f6-bfe8-a849637c5bb8	182f8a59-30bb-4831-8a0b-d0e39bbbe7fa	1b3e27c9-89b6-4660-9539-2b5191e54c89	2026-05-03 20:50:43.879693
\.


--
-- TOC entry 5100 (class 0 OID 41058)
-- Dependencies: 225
-- Data for Name: video; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.video (id, paper_id, creator_id, youtube_id, timestamps, created_at) FROM stdin;
6c3146cd-31d3-447f-a160-852626e201d5	265ff9eb-911a-44b6-be5d-1fed7a023f36	f6efe03f-080e-4545-ba1c-839667dcd390	https://youtube.com/shorts/EKNDPb4qHLA?si=yYuSZGI7t92qEtIG		2026-05-03 22:16:28.338925
48dabb74-0676-40cd-8c61-2c6ddd42f1cd	265ff9eb-911a-44b6-be5d-1fed7a023f36	f6efe03f-080e-4545-ba1c-839667dcd390	https://youtube.com/shorts/EKNDPb4qHLA?si=yYuSZGI7t92qEtIG	\N	2026-05-03 23:33:40.509614
\.


--
-- TOC entry 5104 (class 0 OID 41143)
-- Dependencies: 229
-- Data for Name: video_watch; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.video_watch (id, user_id, video_id, watched_seconds, is_completed, last_watched_at) FROM stdin;
\.


--
-- TOC entry 4911 (class 2606 OID 41213)
-- Name: badge badge_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.badge
    ADD CONSTRAINT badge_name_key UNIQUE (name);


--
-- TOC entry 4913 (class 2606 OID 41211)
-- Name: badge badge_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.badge
    ADD CONSTRAINT badge_pkey PRIMARY KEY (id);


--
-- TOC entry 4892 (class 2606 OID 41106)
-- Name: enrollment enrollment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.enrollment
    ADD CONSTRAINT enrollment_pkey PRIMARY KEY (id);


--
-- TOC entry 4876 (class 2606 OID 40987)
-- Name: level level_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.level
    ADD CONSTRAINT level_name_key UNIQUE (name);


--
-- TOC entry 4878 (class 2606 OID 40985)
-- Name: level level_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.level
    ADD CONSTRAINT level_pkey PRIMARY KEY (id);


--
-- TOC entry 4884 (class 2606 OID 41030)
-- Name: paper paper_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.paper
    ADD CONSTRAINT paper_pkey PRIMARY KEY (id);


--
-- TOC entry 4898 (class 2606 OID 41130)
-- Name: paper_progress paper_progress_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.paper_progress
    ADD CONSTRAINT paper_progress_pkey PRIMARY KEY (id);


--
-- TOC entry 4921 (class 2606 OID 41246)
-- Name: password_reset_token password_reset_token_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_reset_token
    ADD CONSTRAINT password_reset_token_pkey PRIMARY KEY (id);


--
-- TOC entry 4906 (class 2606 OID 41174)
-- Name: pdf_download pdf_download_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pdf_download
    ADD CONSTRAINT pdf_download_pkey PRIMARY KEY (id);


--
-- TOC entry 4890 (class 2606 OID 41091)
-- Name: pdf pdf_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pdf
    ADD CONSTRAINT pdf_pkey PRIMARY KEY (id);


--
-- TOC entry 4917 (class 2606 OID 41226)
-- Name: refresh_token refresh_token_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_token
    ADD CONSTRAINT refresh_token_pkey PRIMARY KEY (id);


--
-- TOC entry 4886 (class 2606 OID 41047)
-- Name: reply reply_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reply
    ADD CONSTRAINT reply_pkey PRIMARY KEY (id);


--
-- TOC entry 4909 (class 2606 OID 41195)
-- Name: streak streak_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.streak
    ADD CONSTRAINT streak_pkey PRIMARY KEY (id);


--
-- TOC entry 4880 (class 2606 OID 40997)
-- Name: subject subject_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subject
    ADD CONSTRAINT subject_pkey PRIMARY KEY (id);


--
-- TOC entry 4882 (class 2606 OID 41014)
-- Name: thread thread_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.thread
    ADD CONSTRAINT thread_pkey PRIMARY KEY (id);


--
-- TOC entry 4925 (class 2606 OID 41262)
-- Name: user_badge user_badge_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_badge
    ADD CONSTRAINT user_badge_pkey PRIMARY KEY (id);


--
-- TOC entry 4874 (class 2606 OID 40975)
-- Name: user user_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_pkey PRIMARY KEY (id);


--
-- TOC entry 4888 (class 2606 OID 41069)
-- Name: video video_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.video
    ADD CONSTRAINT video_pkey PRIMARY KEY (id);


--
-- TOC entry 4902 (class 2606 OID 41153)
-- Name: video_watch video_watch_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.video_watch
    ADD CONSTRAINT video_watch_pkey PRIMARY KEY (id);


--
-- TOC entry 4893 (class 1259 OID 41118)
-- Name: ix_enrollment_subject_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_enrollment_subject_id ON public.enrollment USING btree (subject_id);


--
-- TOC entry 4894 (class 1259 OID 41117)
-- Name: ix_enrollment_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_enrollment_user_id ON public.enrollment USING btree (user_id);


--
-- TOC entry 4895 (class 1259 OID 41142)
-- Name: ix_paper_progress_paper_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_paper_progress_paper_id ON public.paper_progress USING btree (paper_id);


--
-- TOC entry 4896 (class 1259 OID 41141)
-- Name: ix_paper_progress_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_paper_progress_user_id ON public.paper_progress USING btree (user_id);


--
-- TOC entry 4918 (class 1259 OID 41253)
-- Name: ix_password_reset_token_token; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_password_reset_token_token ON public.password_reset_token USING btree (token);


--
-- TOC entry 4919 (class 1259 OID 41252)
-- Name: ix_password_reset_token_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_password_reset_token_user_id ON public.password_reset_token USING btree (user_id);


--
-- TOC entry 4903 (class 1259 OID 41186)
-- Name: ix_pdf_download_pdf_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_pdf_download_pdf_id ON public.pdf_download USING btree (pdf_id);


--
-- TOC entry 4904 (class 1259 OID 41185)
-- Name: ix_pdf_download_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_pdf_download_user_id ON public.pdf_download USING btree (user_id);


--
-- TOC entry 4914 (class 1259 OID 41232)
-- Name: ix_refresh_token_token; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_refresh_token_token ON public.refresh_token USING btree (token);


--
-- TOC entry 4915 (class 1259 OID 41233)
-- Name: ix_refresh_token_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_refresh_token_user_id ON public.refresh_token USING btree (user_id);


--
-- TOC entry 4907 (class 1259 OID 41201)
-- Name: ix_streak_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_streak_user_id ON public.streak USING btree (user_id);


--
-- TOC entry 4922 (class 1259 OID 41274)
-- Name: ix_user_badge_badge_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_user_badge_badge_id ON public.user_badge USING btree (badge_id);


--
-- TOC entry 4923 (class 1259 OID 41273)
-- Name: ix_user_badge_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_user_badge_user_id ON public.user_badge USING btree (user_id);


--
-- TOC entry 4872 (class 1259 OID 40976)
-- Name: ix_user_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_user_email ON public."user" USING btree (email);


--
-- TOC entry 4899 (class 1259 OID 41164)
-- Name: ix_video_watch_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_video_watch_user_id ON public.video_watch USING btree (user_id);


--
-- TOC entry 4900 (class 1259 OID 41165)
-- Name: ix_video_watch_video_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_video_watch_video_id ON public.video_watch USING btree (video_id);


--
-- TOC entry 4934 (class 2606 OID 41112)
-- Name: enrollment enrollment_subject_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.enrollment
    ADD CONSTRAINT enrollment_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subject(id);


--
-- TOC entry 4935 (class 2606 OID 41107)
-- Name: enrollment enrollment_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.enrollment
    ADD CONSTRAINT enrollment_user_id_fkey FOREIGN KEY (user_id) REFERENCES public."user"(id);


--
-- TOC entry 4936 (class 2606 OID 41136)
-- Name: paper_progress paper_progress_paper_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.paper_progress
    ADD CONSTRAINT paper_progress_paper_id_fkey FOREIGN KEY (paper_id) REFERENCES public.paper(id);


--
-- TOC entry 4937 (class 2606 OID 41131)
-- Name: paper_progress paper_progress_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.paper_progress
    ADD CONSTRAINT paper_progress_user_id_fkey FOREIGN KEY (user_id) REFERENCES public."user"(id);


--
-- TOC entry 4928 (class 2606 OID 41031)
-- Name: paper paper_subject_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.paper
    ADD CONSTRAINT paper_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subject(id);


--
-- TOC entry 4944 (class 2606 OID 41247)
-- Name: password_reset_token password_reset_token_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_reset_token
    ADD CONSTRAINT password_reset_token_user_id_fkey FOREIGN KEY (user_id) REFERENCES public."user"(id);


--
-- TOC entry 4940 (class 2606 OID 41180)
-- Name: pdf_download pdf_download_pdf_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pdf_download
    ADD CONSTRAINT pdf_download_pdf_id_fkey FOREIGN KEY (pdf_id) REFERENCES public.pdf(id);


--
-- TOC entry 4941 (class 2606 OID 41175)
-- Name: pdf_download pdf_download_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pdf_download
    ADD CONSTRAINT pdf_download_user_id_fkey FOREIGN KEY (user_id) REFERENCES public."user"(id);


--
-- TOC entry 4933 (class 2606 OID 41092)
-- Name: pdf pdf_paper_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pdf
    ADD CONSTRAINT pdf_paper_id_fkey FOREIGN KEY (paper_id) REFERENCES public.paper(id);


--
-- TOC entry 4943 (class 2606 OID 41227)
-- Name: refresh_token refresh_token_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_token
    ADD CONSTRAINT refresh_token_user_id_fkey FOREIGN KEY (user_id) REFERENCES public."user"(id);


--
-- TOC entry 4929 (class 2606 OID 41053)
-- Name: reply reply_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reply
    ADD CONSTRAINT reply_author_id_fkey FOREIGN KEY (author_id) REFERENCES public."user"(id);


--
-- TOC entry 4930 (class 2606 OID 41048)
-- Name: reply reply_thread_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reply
    ADD CONSTRAINT reply_thread_id_fkey FOREIGN KEY (thread_id) REFERENCES public.thread(id);


--
-- TOC entry 4942 (class 2606 OID 41196)
-- Name: streak streak_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.streak
    ADD CONSTRAINT streak_user_id_fkey FOREIGN KEY (user_id) REFERENCES public."user"(id);


--
-- TOC entry 4926 (class 2606 OID 40998)
-- Name: subject subject_level_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subject
    ADD CONSTRAINT subject_level_id_fkey FOREIGN KEY (level_id) REFERENCES public.level(id);


--
-- TOC entry 4927 (class 2606 OID 41015)
-- Name: thread thread_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.thread
    ADD CONSTRAINT thread_author_id_fkey FOREIGN KEY (author_id) REFERENCES public."user"(id);


--
-- TOC entry 4945 (class 2606 OID 41268)
-- Name: user_badge user_badge_badge_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_badge
    ADD CONSTRAINT user_badge_badge_id_fkey FOREIGN KEY (badge_id) REFERENCES public.badge(id);


--
-- TOC entry 4946 (class 2606 OID 41263)
-- Name: user_badge user_badge_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_badge
    ADD CONSTRAINT user_badge_user_id_fkey FOREIGN KEY (user_id) REFERENCES public."user"(id);


--
-- TOC entry 4931 (class 2606 OID 41075)
-- Name: video video_creator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.video
    ADD CONSTRAINT video_creator_id_fkey FOREIGN KEY (creator_id) REFERENCES public."user"(id);


--
-- TOC entry 4932 (class 2606 OID 41070)
-- Name: video video_paper_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.video
    ADD CONSTRAINT video_paper_id_fkey FOREIGN KEY (paper_id) REFERENCES public.paper(id);


--
-- TOC entry 4938 (class 2606 OID 41154)
-- Name: video_watch video_watch_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.video_watch
    ADD CONSTRAINT video_watch_user_id_fkey FOREIGN KEY (user_id) REFERENCES public."user"(id);


--
-- TOC entry 4939 (class 2606 OID 41159)
-- Name: video_watch video_watch_video_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.video_watch
    ADD CONSTRAINT video_watch_video_id_fkey FOREIGN KEY (video_id) REFERENCES public.video(id);


-- Completed on 2026-05-04 14:42:29

--
-- PostgreSQL database dump complete
--

\unrestrict PEQpuM4x23bYtlgiS89KTD6IXelutgFoM2nNw8zwxVU0BI6gm2H1HpAT5BeodTK

