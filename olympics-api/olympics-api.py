#Author: Kevin Chen, Etienne Richart

import sys
import argparse
import flask
import json
import psycopg2
from config import password
from config import database
from config import user

app = flask.Flask(__name__)

def cursor_init():
    '''Connects to database and initializes the cursor.'''
    try:
        connection = psycopg2.connect(database=database, user=user, password=password)
        cursor = connection.cursor()
    except Exception as e:
        print(e)
        exit()
    return cursor

@app.route('/games')
def get_games():
    ''' Returns JSON of all the games order from old to new. '''
    cursor = cursor_init()
    games_list = []
    query = 'SELECT * FROM competitions ORDER BY competitions.year;'
    try:
        cursor.execute(query)
    except Exception as e:
        print(e)
        exit()

    for game in cursor:
        game_dict = {
            "id": game[0],
            "year": game[1],
            "season": game[2],
            "city": game[3]
        }
        games_list.append(game_dict)
    return json.dumps(games_list)

@app.route('/nocs')
def get_nocs():
    ''' Returns JSON containing all the NOC in althebetical order. '''
    cursor = cursor_init()
    noc_list = []
    query = 'SELECT * FROM countries ORDER BY countries.noc;'
    try:
        cursor.execute(query)
    except Exception as e:
        print(e)
        exit()

    for noc in cursor:
        noc_dict = {
            "abbreviation": noc[1],
            "name": noc[2]
        }
        noc_list.append(noc_dict)
    return json.dumps(noc_list)

@app.route('/medalists/games/<games_id>')
def get_medalists(games_id):
    ''' Returns a JSON list of dictionaries of medalist at a specified game. If noc is included filters to only athletes from the noc. '''

    cursor = cursor_init()
    medalist_list = []
    noc = flask.request.args.get('noc')
    print(noc)
    if noc is None:
        query = '''SELECT athletes.id, athletes.name, athletes.sex, events.sport, events.event, medals.medal_type
                FROM athletes, events, medals, competitions
                WHERE medals.events_id = events.id
                AND medals.athletes_id = athletes.id
                AND competitions.id = {};'''.format(games_id)
    else:
        query = '''SELECT athletes.id, athletes.name, athletes.sex, events.sport, events.event, medals.medal_type
                FROM athletes, events, medals, competitions, athletes_countries_age_competitions, countries
                WHERE medals.events_id = events.id
                AND medals.athletes_id = athletes.id
                AND competitions.id = {0}
                AND athletes_countries_age_competitions.athletes_id = athletes.id
                AND athletes_countries_age_competitions.competitions_id = {0}
                AND countries.noc = '{1}'
                AND athletes_countries_age_competitions.noc_id = countries.id;'''.format(games_id, noc)

    try:
        cursor.execute(query)
    except Exception as e:
        print(e)
        exit()

    for medalist in cursor:
        medalist_dict = {
            "athlete_id": medalist[0],
            "athlete_name": medalist[1],
            "athlete_sex": medalist[2],
            "sport": medalist[3],
            "event": medalist[4],
            "medal": medalist[5]
        }
        medalist_list.append(medalist_dict)
    return json.dumps(medalist_list)


@app.route('/help')
def get_help():
    return flask.render_template('help.html')

if __name__ == '__main__':
    parser = argparse.ArgumentParser('A sample Flask application/API')
    parser.add_argument('host', help='the host on which this application is running')
    parser.add_argument('port', type=int, help='the port on which this application is listening')
    arguments = parser.parse_args()
    app.run(host=arguments.host, port=arguments.port, debug=True)
    