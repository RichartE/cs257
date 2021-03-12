'''
    astronaut_webapp
    Etienne Richart
'''
import sys
import flask
import json
import config
import psycopg2
import html

api = flask.Blueprint('api', __name__)

def get_connection():
    ''' Returns a connection to the database described in the
        config module. May raise an exception as described in the
        documentation for psycopg2.connect. '''
    return psycopg2.connect(database=config.database,
                            user=config.user,
                            password=config.password)


########### The API endpoints ###########
@api.route('/help/')
def get_help():
    '''API Documentation'''
    with open('./doc/api-design.txt', 'r') as helpfile:
        txt = html.escape(helpfile.read())
        paragraphs = txt.split('\n')[1:]
        htmlReady = '<p>\t' + '</p><p>\t'.join(paragraphs) + '</p>'
        return flask.render_template('help.html', api_design=htmlReady)
    
@api.route('/features/')
def get_features():
    '''An JSON list of dictionaries, each which represent a column in a table.'''
    query = '''SELECT column_name, data_type, table_name
                FROM information_schema.columns
                WHERE table_schema NOT IN ('information_schema', 'pg_catalog')
                ORDER BY table_name, ordinal_position;'''
    feature_list = []
    try:
        connection = get_connection()
        cursor = connection.cursor()
        cursor.execute(query)
        for row in cursor:
            feature = {'name':row[0],
                      'type':row[1],
                      'table':row[2]}
            feature_list.append(feature)
        cursor.close()
        connection.close()
    except Exception as e:
        print(e, file=sys.stderr)

    return json.dumps(feature_list)

@api.route('/astronauts/raw/') 
def get_astronauts():
    ''' Returns a list of all the astronauts in the database''' 
    
    sort = flask.request.args.get('order', 'astronauts.id').casefold()
    order = []
    if 'id' in sort:
        order.append('astronauts.id')
    if 'english_name' in sort:
        order.append('astronauts.english_name')
    if 'original_name' in sort:
        order.append('astronauts.original_name')
    if 'nwnumber' in sort:
        order.append('astronauts.nwnumber')
    if 'sex' in sort:
        order.append('astronauts.sex')
    if 'yob' in sort:
        order.append('astronauts.yob')
    if 'nationality' in sort:
        order.append('nationality.nation')
    if 'mil_civ' in sort:
        order.append('astronauts.mil_civ')
    if 'yos' in sort:
        order.append('astronauts.yos')
    if 'total_missions' in sort:
        order.append('astronauts.total_missions')
    if 'total_mission_hours' in sort:
        order.append('astronauts.total_mission_hours')
    if 'total_eva_hours' in sort:
        order.append('astronauts.total_eva_hours')
    if len(order) == 0:
        order = 'astronauts.id'
    else:
        order = ', '.join(order)
    query = '''SELECT astronauts.id, astronauts.english_name, astronauts.original_name, astronauts.nwnumber, astronauts.sex, astronauts.yob, nationality.nation, astronauts.mil_civ, astronauts.yos, astronauts.total_missions, astronauts.total_mission_hours, astronauts.total_eva_hours FROM astronauts, nationality WHERE astronauts.nationality = nationality.id ORDER BY ''' + order + ';'

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

@api.route('/astronauts/list/') 
def get_astronauts_list_raw():
    ''' Returns a list of all the astronauts in the database sorter by name'''
    query = '''SELECT astronauts.english_name, astronauts.yos, nationality.nation, nationality.code FROM astronauts, nationality WHERE astronauts.nationality = nationality.id ORDER BY '''

    features = flask.request.args.get('order', 'name').casefold()
    if 'year' in features:
        query += 'astronauts.yos;'
    else:
        query += 'astronauts.english_name;'
    
    astronaut_list = []
    try:
        connection = get_connection()
        cursor = connection.cursor()
        cursor.execute(query)
        for row in cursor:
            astronaut = {'english_name':row[0], 'yos':row[1],
                      'nationality':row[2], 'country_code':row[3]}
            astronaut_list.append(astronaut)
        cursor.close()
        connection.close()
    except Exception as e:
        print(e, file=sys.stderr)
    return json.dumps(astronaut_list)

@api.route('/missions/raw/') 
def get_missions():
    ''' Returns a list of all the missions in the database'''

    sort = flask.request.args.get('order', 'id').casefold()
    order = []
    if 'id' in sort:
        order.append('missions.id')
    if 'title' in sort:
        order.append('missions.title')
    if 'original_name' in sort:
        order.append('missions.mission_year')
    if 'nwnumber' in sort:
        order.append('missions.ascent')
    if 'sex' in sort:
        order.append('missions.orbit')
    if 'yob' in sort:
        order.append('missions.decent')
    if 'nationality' in sort:
        order.append('missions.duration')
    if 'mil_civ' in sort:
        order.append('missions.combined_eva')
    if 'yos' in sort:
        order.append('missions.composition')
    if len(order) == 0:
        order = 'missins.id'
    else:
        order = ', '.join(order)
    query = '''SELECT missions.id, missions.title, missions.mission_year, missions.ascent, missions.orbit, missions.decent, missions.duration, missions.combined_eva, missions.composition FROM missions ORDER BY ''' + order + ';'

    
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

@api.route('/missions/list/') 
def get_missions_list_raw():
    ''' Returns a list of all the astronauts in the database sorter by name'''
    query = '''SELECT title, mission_year FROM missions ORDER BY '''

    features = flask.request.args.get('order', 'title').casefold()
    if 'year' in features:
        query += 'mission_year;'
    else:
        query += 'title;'
    
    mission_list = []
    try:
        connection = get_connection()
        cursor = connection.cursor()
        cursor.execute(query)
        for row in cursor:
            mission = {'title':row[0], 'year':row[1]}
            mission_list.append(mission)
        cursor.close()
        connection.close()
    except Exception as e:
        print(e, file=sys.stderr)
    return json.dumps(mission_list)

def get_list(feature):
    if 'astronauts' in feature:
        if 'id' in feature:
            return 'astronauts.id'
        if 'english_name' in feature:
            return 'astronauts.english_name'
        if 'original_name' in feature:
            return 'astronauts.original_name'
        if 'nwnumber' in feature:
            return 'astronauts.nwnumber'
        if 'sex' in feature:
            return 'astronauts.sex'
        if 'yob' in feature:
            return 'astronauts.yob'
        if 'nationality' in feature:
            return 'nationality.nation'
        if 'mil_civ' in feature:
            return 'astronauts.mil_civ'
        if 'yos' in feature:
            return 'astronauts.yos'
        if 'total_missions' in feature:
            return 'astronauts.total_missions'
        if 'total_mission_hours' in feature:
            return 'astronauts.total_mission_hours'
        if 'total_eva_hours' in feature:
            return 'astronauts.total_eva_hours'
    if 'missions' in feature:
        if 'id' in feature:
            return 'missions.id'
        if 'title' in feature:
            return 'missions.title'
        if 'original_name' in feature:
            return 'missions.mission_year'
        if 'nwnumber' in feature:
            return 'missions.ascent'
        if 'sex' in feature:
            return 'missions.orbit'
        if 'yob' in feature:
            return 'missions.decent'
        if 'nationality' in feature:
            return 'missions.duration'
        if 'mil_civ' in feature:
            return 'missions.combined_eva'
        if 'yos' in feature:
            return 'missions.composition'
    if 'nationality' in feature:
        if 'id' in feature:
            return 'nationality.id'
        if 'code' in feature:
            return 'nationality.code'
        if 'nation' in feature:
            return 'nationality.nation'
    if 'astronaut_mission' in feature:
        if 'id' in feature:
            return 'astronaut_mission.id'
        if 'occupation' in feature:
            return 'astronaut_mission.occupation'
        if 'eva_hours' in feature:
            return 'astronaut_mission.eva_hours'
        if 'mission_num' in feature:
            return 'astronaut_mission.mission_num'
        if 'selection' in feature:
            return 'astronaut_mission.selection'
        if 'astronaut_mission.astronaut' in feature:
            return 'astronaut_mission.astronaut'
        if 'astronaut_mission.mission' in feature:
            return 'astronaut_mission.mission'
    return 'astronauts.id'
        
@api.route('/graphing/')
def get_graph():
    x = flask.request.args.get('x', 'nationality.nation').casefold()
    y = flask.request.args.get('y', 'astronauts.id').casefold()
    aggregation = flask.request.args.get('aggregate', 'COUNT').upper()
    order = flask.request.args.get('order', '').upper()
    x = get_list(x)
    y = get_list(y)
    query_from = set()
    query_from.add(x.split('.')[0])
    query_from.add(y.split('.')[0])
    if 'SUM' in aggregation:
        aggregation = 'SUM'
    else:
        aggregation = 'COUNT'
    if 'DESC' in order:
        order = 'DESC'
    elif 'ASC' in order:
        order = 'ASC'
    else:
        order = ''

    query = 'SELECT ' + aggregation + '(' + y + '), ' + x + ' FROM ' + ', '.join(query_from) + ' WHERE astronauts.nationality = nationality.id GROUP BY nationality.nation ORDER BY ' + aggregation + '(' + y + ') ' + order + ';'
    graph_list = []
    try:
        connection = get_connection()
        cursor = connection.cursor()
        cursor.execute(query)
        for row in cursor:
            entry = {'x':row[1], 'y':row[0]}
            graph_list.append(entry)
        cursor.close()
        connection.close()
    except Exception as e:
        print(e, file=sys.stderr)
    return json.dumps(graph_list)