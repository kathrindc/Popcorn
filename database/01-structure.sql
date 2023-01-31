DROP TABLE IF EXISTS theaters;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS movies;
DROP TABLE IF EXISTS shows;
DROP TABLE IF EXISTS tickets;
DROP TABLE IF EXISTS ratings;

CREATE TABLE theaters (
    "id" BIGSERIAL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "features" JSON NOT NULL
);

CREATE TABLE seats (
    "id" BIGSERIAL PRIMARY KEY,
    "displayNum" INT NOT NULL,
    "displayX" INT NOT NULL,
    "displayY" INT NOT NULL,
    "flagDeluxe" BOOLEAN NOT NULL DEFAULT FALSE,
    "flagWheelchair" BOOLEAN NOT NULL DEFAULT FALSE,
    "theaterId" BIGINT NOT NULL REFERENCES theaters ("id") ON DELETE CASCADE
);

CREATE TABLE users (
    "id" BIGSERIAL PRIMARY KEY,
    "role" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "nameFirst" TEXT NOT NULL,
    "nameLast" TEXT NOT NULL,
    "birthday" DATE,
    "addressLine1" TEXT,
    "addressLine2" TEXT,
    "addressPostcode" TEXT,
    "addressTown" TEXT,
    "addressState" TEXT,
    "addressCountry" VARCHAR(2),
    CONSTRAINT users_email_unique UNIQUE ("email")
);

CREATE TABLE user_confirmations (
    "userId" BIGINT PRIMARY KEY REFERENCES users ("id") ON DELETE CASCADE,
    "key" TEXT NOT NULL,
    "confirmed" BOOLEAN NOT NULL DEFAULT FALSE,
    "sentAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confirmedAt" TIMESTAMP WITH TIME ZONE
);

CREATE TABLE movies (
    "id" BIGSERIAL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "duration" INT NOT NULL,
    "minimumAge" INT NULL,
    "releasedAt" DATE NOT NULL,
    "posterUrl" TEXT,
    "imdbUrl" TEXT
);

CREATE TABLE shows (
    "id" BIGSERIAL PRIMARY KEY,
    "variant" JSON NOT NULL,
    "startsAt" TIMESTAMP WITH TIME ZONE NOT NULL,
    "movieId" BIGINT NOT NULL REFERENCES movies ("id") ON DELETE CASCADE,
    "theaterId" BIGINT NOT NULL REFERENCES theaters ("id") ON DELETE CASCADE
);

CREATE TABLE orders (
    "id" BIGSERIAL PRIMARY KEY,
    "userId" BIGINT NOT NULL REFERENCES users ("id") ON DELETE CASCADE,
    "complete" BOOLEAN NOT NULL DEFAULT FALSE,
    "submittedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP WITH TIME ZONE
);

CREATE TABLE tickets (
    "id" BIGSERIAL PRIMARY KEY,
    "orderId" BIGINT NOT NULL REFERENCES orders ("id") ON DELETE CASCADE,
    "showId" BIGINT NOT NULL REFERENCES shows ("id") ON DELETE CASCADE,
    "seatId" BIGINT NOT NULL REFERENCES seats ("id") ON DELETE CASCADE,
    CONSTRAINT tickets_show_seat_unique UNIQUE ("seatId", "showId")
);

CREATE TABLE ratings (
    "id" BIGSERIAL PRIMARY KEY,
    "movieId" BIGINT NOT NULL REFERENCES movies ("id") ON DELETE CASCADE,
    "userId" BIGINT NOT NULL REFERENCES users ("id") ON DELETE CASCADE,
    "stars" INT NOT NULL,
    "content" TEXT NOT NULL,
    CONSTRAINT ratings_user_movie_unique UNIQUE ("movieId", "userId"),
    CONSTRAINT ratings_star_count CHECK (("stars" >= 1 AND "stars" <= 5))
);
