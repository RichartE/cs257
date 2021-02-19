CREATE TABLE nationality (
    id integer,
    nation text
);

CREATE TABLE astronauts (
    id integer,
    english_name text,
    original_name text,
    nwnumber integer,
    sex varchar(1),
    yob integer,
    nationality integer,
    mil_civ varchar(3),
    yos integer,
    total_missions integer,
    total_mission_hours numeric,
    total_eva_hours numeric,
    stat text,
    alma_mater_one text,
    alma_mater_two text,
    undergrad_major text,
    grad_major text,
    death_date date,
    death_mission text
);

CREATE TABLE missions (
    id integer,
    title text,
    mission_year integer,
    ascent text,
    orbit text,
    decent text,
    duration numeric,
    combined_eva numeric,
    composition text
);

CREATE TABLE astronaut_mission (
    id integer,
    astronaut integer,
    mission integer,
    occupation text,
    eva_hours numeric,
    mission_num integer,
    selection text
);