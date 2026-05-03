# Database Schema & Relationships

This document tracks the structure of the First Choice Education database. All data is managed via **SQLModel** (SQLAlchemy + Pydantic).

## Tables & Models

### 1. `User` (The `user` table)
Stores all user accounts (Students, Creators, and Admins).
- `id` (UUID): Primary Key.
- `full_name` (String): User's full name.
- `email` (String): Unique email (used for login).
- `password_hash` (String): Argon2/Bcrypt hashed password.
- `role` (String): One of `student`, `creator`, or `admin`.
- `level` (String): Optional (e.g., "O-Level" or "A-Level").
- `is_active` (Boolean): Default `True`.
- `created_at` (DateTime): Auto-generated timestamp.

### 2. `Level` (The `level` table)
Defines the main GCE categories.
- `id` (UUID): Primary Key.
- `name` (String): Unique (e.g., "Ordinary Level", "Advanced Level").
- **Relationships:**
  - `subjects`: One-to-Many with `Subject`.

### 3. `Subject` (The `subject` table)
Academic subjects within a level.
- `id` (UUID): Primary Key.
- `name` (String): e.g., "Mathematics", "Physics".
- `level_id` (UUID): Foreign Key -> `Level.id`.
- **Relationships:**
  - `level`: Many-to-One with `Level`.
  - `papers`: One-to-Many with `Paper`.

### 4. `Paper` (The `paper` table)
Specific past examination papers.
- `id` (UUID): Primary Key.
- `subject_id` (UUID): Foreign Key -> `Subject.id`.
- `year` (Integer): e.g., 2023.
- `paper_type` (String): e.g., "Paper 1", "Paper 2".
- **Relationships:**
  - `subject`: Many-to-One with `Subject`.
  - `videos`: One-to-Many with `Video`.
  - `pdfs`: One-to-Many with `PDF`.

### 5. `Video` (The `video` table)
Video solutions for a specific paper.
- `id` (UUID): Primary Key.
- `paper_id` (UUID): Foreign Key -> `Paper.id`.
- `creator_id` (UUID): Foreign Key -> `User.id` (The person who made the video).
- `youtube_id` (String): The ID part of the YouTube URL.
- `timestamps` (String): Optional JSON-encoded string for video chapters.
- **Relationships:**
  - `paper`: Many-to-One with `Paper`.

### 6. `PDF` (The `pdf` table)
Digital copies of questions and marking schemes.
- `id` (UUID): Primary Key.
- `paper_id` (UUID): Foreign Key -> `Paper.id`.
- `file_url` (String): URL to the PDF file (e.g., on AWS S3 or Cloudinary).
- `pdf_type` (String): Either `question` or `answer`.
- **Relationships:**
  - `paper`: Many-to-One with `Paper`.

---

## Entity Relationship Diagram (Summary)
- **User** 1 --- N **Video** (A user/creator can upload many videos)
- **Level** 1 --- N **Subject** (A level has many subjects)
- **Subject** 1 --- N **Paper** (A subject has many years/papers)
- **Paper** 1 --- N **Video** (A paper can have multiple video walkthroughs)
- **Paper** 1 --- N **PDF** (A paper has at least two PDFs: Question and Answer)
