'''
    astronaut_webapp
    Etienne Richart
'''
import sys
import flask
import json
import config
import psycopg2

api = flask.Blueprint('api', __name__)

def get_connection():
    ''' Returns a connection to the database described in the
        config module. May raise an exception as described in the
        documentation for psycopg2.connect. '''
    return psycopg2.connect(database=config.database,
                            user=config.user,
                            password=config.password)


########### The API endpoints ###########
@api.route('/astronauts/raw/') 
def get_astronauts():
    ''' Returns a list of all the astronauts in the database'''
    query = '''SELECT * FROM astronauts;'''

    sort_argument = flask.request.args.get('features', None)
    if sort_argument is not None:
        select = sort_argument
    else:
        select = '*'
    
    astronaut_list = []
    try:
        connection = get_connection()
        cursor = connection.cursor()
        cursor.execute(query)
        for row in cursor:
            astronaut = {'id':row[0],
                      'english_name':row[1], 'original_name':row[2],
                      'nwnumber':row[3], 'sex':row[4], 'yob':row[5],
                      'nationality':row[6], 'mil_civ':row[7], 'yos':row[8], 
                      'total_missions':row[9], 'total_mission_hours':str(row[10]), 
                      'total_eva_hours':str(row[11])}
            astronaut_list.append(astronaut)
        cursor.close()
        connection.close()
    except Exception as e:
        print(e, file=sys.stderr)

    return json.dumps(astronaut_list)

@api.route('/missions/raw/') 
def get_missions():
    ''' Returns a list of all the missions in the database'''
    query = '''SELECT * FROM missions;'''

    sort_argument = flask.request.args.get('features', None)
    if sort_argument is not None:
        select = sort_argument
    else:
        select = '*'
    
    mission_list = []
    try:
        connection = get_connection()
        cursor = connection.cursor()
        cursor.execute(query)
        for row in cursor:
            mission = {'id':str(row[0]),
                      'title':row[1], 'mission_year':row[2],
                      'ascent':row[3], 'orbit':row[4], 'decent':row[5],
                      'duration':str(row[6]), 'combined_eva':str(row[7]), 
                      'composition':row[8]}
            mission_list.append(mission)
        cursor.close()
        connection.close()
    except Exception as e:
        print(e, file=sys.stderr)

    return json.dumps(mission_list)



