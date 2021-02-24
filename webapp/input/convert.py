import csv

def create_astronaut_database_tables():
    '''Creates nationalities_psql.csv, astronauts_psql.csv, 
    '''
    astronaut_ids = set()
    nationalities = {}
    missions = {}
    nationality_id = 1
    mission_id = 1
    with open('Astronaut database.csv') as csvfile, open('../output/astronauts_psql.csv', 'w', newline='') as csv_outfile, open('../output/astronaut_mission_psql.csv', 'w', newline='') as csv_other_outfile, open('../output/nationalities_psql.csv', 'w', newline='') as csv_third_outfile:
        reader = csv.reader(csvfile)
        next(reader)
        writer = csv.writer(csv_outfile)
        writer_b = csv.writer(csv_other_outfile)
        writer_c = csv.writer(csv_third_outfile)
        for row in reader:
            astronaut_id = row[1]
            mil_civ = row[8]
            if astronaut_id not in astronaut_ids:
                #create an entry for the astronaut
                nwnumber = row[2]
                english_name = row[3]
                original_name = row[4]
                sex = row[5]
                yob = row[6]
                nationality = row[7]
                mil_civ = row[8]
                yos = row[10]
                total_missions = row[12]
                total_mission_hours = row[20]
                total_eva_hours = row[23]

                astronaut_ids.add(astronaut_id)

                if nationality in nationalities:
                    nationality = nationalities[nationality]
                else:
                    nationalities[nationality] = nationality_id
                    writer_c.writerow([nationality_id, nationality])
                    nationality = nationality_id
                    nationality_id += 1
            
                writer.writerow([
                    astronaut_id, 
                    english_name, 
                    original_name, 
                    nwnumber, 
                    sex, 
                    yob, 
                    nationality, 
                    mil_civ, 
                    yos, 
                    total_missions, 
                    total_mission_hours, 
                    total_eva_hours])
            #create mission or update mission
            mission_title = row[15]
            eva_on_mission = float(row[22])
            if mission_title not in missions:
                #create mission
                mission_year = row[14]
                ascent = row[16]
                orbit = row[17]
                decent = row[18]
                duration = row[19]
                combined_eva = eva_on_mission
                composition = mil_civ
                missions[mission_title] = [mission_id, mission_title, mission_year, ascent, orbit, decent, duration, combined_eva, composition]
                mission_id += 1
            else:
                #update mission
                missions[mission_title][7] += eva_on_mission
                if mil_civ.casefold() not in missions[mission_title][8]:
                    missions[mission_title][8] = 'mil/civ'
            #create binding table
            astronaut_mission_id = row[0]
            astronaut = astronaut_id
            mission = missions[mission_title][0]
            occupation = row[13]
            eva_hours = eva_on_mission
            mission_num = row[11]
            selection = row[9]
            writer_b.writerow([
                astronaut_mission_id, 
                astronaut, 
                mission, 
                occupation, 
                eva_hours, 
                mission_num, 
                selection])

    with open('../output/missions_psql.csv', 'w', newline='') as csv_outfile:
        writer = csv.writer(csv_outfile)
        for mission in missions.values():
            mission[7] = round(mission[7], 2)
            writer.writerow(mission)

if __name__ == '__main__':
    create_astronaut_database_tables()