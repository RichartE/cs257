'''
    astronaut_webapp
    Etienne Richart
'''
import sys
import os
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
@api.route('/help/')
def get_help():
    '''Returns an HTML page with the API Documentation and Database Schema'''
    with open('./doc/api-design.txt', 'r') as helpfile:
        with open('./doc/database-schema.sql', 'r') as schema:
            tables = [table + ';' for table in schema.read().split(';') if table]
            return flask.render_template('help.html', api_design=helpfile.read(), db_schema0=tables[0], db_schema1=tables[1], db_schema2=tables[2], db_schema3=tables[3])
    
@api.route('/features/')
def get_features():
    '''
    Returns a JSON list of dictionaries, each which represent a column in a table.
    Each dictionay entry has the column name, type and the table they come from.
    '''
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
    '''
    The astronauts table from the database except that nationality is replaced with the actual nation name from the nationality table.
    Can also order the table by passing feature names to the optional parameter order.
    ''' 
    
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
    ''' 
    Returns a list of all the astronauts's English name, year selected, nationality and country code.
    Can be sorted by name or year selected by passing the optional parameter order {year | name}.
    '''
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
    ''' 
    Returns the missions table in the database.
    Can be ordered by features in the missions table by passing them to the optional order parameter.
    '''

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
        order = 'missions.id'
    else:
        order = ', '.join(order)
    query = '''SELECT missions.id, missions.title, missions.mission_year, missions.ascent, missions.orbit, missions.decent, missions.duration, missions.combined_eva, missions.composition FROM missions ORDER BY ''' + order + ';'

    
    mission_list = []
    try:
        connection = get_connection()
        cursor = connection.cursor()
        cursor.execute(query)
        for row in cursor:
            mission = {'id':row[0],
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
    ''' 
    Returns a list of all the missions' title, and year.
    Can be sorted by title or year selected by passing the optional parameter order {year | title}.
    '''
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

table = set()

def get_list(feature):
    '''
    Returns the proper feature name to prevent SQL injection. 
    Populates the table set that will be placed in the FROM block of the graphing endpoint.
    If no match is found returns -1.
    '''
    if 'astronauts' in feature:
        table.add('astronauts')
        if 'id' in feature:
            return 'astronauts.id'
        elif 'english_name' in feature:
            return 'astronauts.english_name'
        elif 'original_name' in feature:
            return 'astronauts.original_name'
        elif 'nwnumber' in feature:
            return 'astronauts.nwnumber'
        elif 'sex' in feature:
            return 'astronauts.sex'
        elif 'yob' in feature:
            return 'astronauts.yob'
        elif 'nationality' in feature:
            return 'astronauts.nationality'
        elif 'mil_civ' in feature:
            return 'astronauts.mil_civ'
        elif 'yos' in feature:
            return 'astronauts.yos'
        elif 'total_missions' in feature:
            return 'astronauts.total_missions'
        elif 'total_mission_hours' in feature:
            return 'astronauts.total_mission_hours'
        elif 'total_eva_hours' in feature:
            return 'astronauts.total_eva_hours'
    elif 'missions' in feature:
        table.add('missions')
        if 'id' in feature:
            return 'missions.id'
        elif 'title' in feature:
            return 'missions.title'
        elif 'original_name' in feature:
            return 'missions.mission_year'
        elif 'nwnumber' in feature:
            return 'missions.ascent'
        elif 'sex' in feature:
            return 'missions.orbit'
        elif 'yob' in feature:
            return 'missions.decent'
        elif 'nationality' in feature:
            return 'missions.duration'
        elif 'mil_civ' in feature:
            return 'missions.combined_eva'
        elif 'yos' in feature:
            return 'missions.composition'
    elif 'astronaut_mission' in feature:
        table.add('astronaut_mission')
        if 'id' in feature:
            return 'astronaut_mission.id'
        elif 'occupation' in feature:
            return 'astronaut_mission.occupation'
        elif 'eva_hours' in feature:
            return 'astronaut_mission.eva_hours'
        elif 'mission_num' in feature:
            return 'astronaut_mission.mission_num'
        elif 'selection' in feature:
            return 'astronaut_mission.selection'
        elif 'astronaut_mission.astronaut' in feature:
            return 'astronaut_mission.astronaut'
        elif 'astronaut_mission.mission' in feature:
            return 'astronaut_mission.mission'
    elif 'nationality' in feature:
        table.add('nationality')
        if 'id' in feature:
            return 'nationality.id'
        elif 'code' in feature:
            return 'nationality.code'
        elif 'nation' in feature:
            return 'nationality.nation'
    return -1

search_set = {'astronauts': set(), 'missions': set(), 'crafts': set()}
@api.route('/search/') 
def search():
    '''
    Sets the search_set dictionary for the profile endpoint and, 
    returns a list of astronauts' English name and original name, mission titles and spacecraft names.
    '''
    try:
        connection = get_connection()
        cursor = connection.cursor()
        query = 'SELECT english_name, original_name FROM astronauts ORDER BY english_name;'
        cursor.execute(query)
        for row in cursor:
            search_set['astronauts'].add(row[0])
            search_set['astronauts'].add(row[1])
        query = 'SELECT title FROM missions ORDER BY title;'
        cursor.execute(query)
        for row in cursor:
            search_set['missions'].add(row[0])
        query = 'SELECT DISTINCT ascent FROM missions ORDER BY ascent;'
        cursor.execute(query)
        for row in cursor:
            search_set['crafts'].add(row[0])
        query = 'SELECT DISTINCT orbit FROM missions ORDER BY orbit;'
        cursor.execute(query)
        for row in cursor:
            search_set['crafts'].add(row[0])
        query = 'SELECT DISTINCT decent FROM missions ORDER BY decent;'
        cursor.execute(query)
        for row in cursor:
            search_set['crafts'].add(row[0])
        cursor.close()
        connection.close()
    except Exception as e:
        print(e, file=sys.stderr)
    return json.dumps([*search_set['astronauts'], *search_set['missions'], *search_set['crafts']])

@api.route('/profile/') 
def get_profile():
    '''Returns a profile page for astronauts, missions or spacecrafts.'''
    name = flask.request.args.get('name')
    if not len(search_set['astronauts']) > 0:
        search()
    if name in search_set['astronauts']:
        missions_html = ''
        try:
            connection = get_connection()
            cursor = connection.cursor()
            query = "SELECT * FROM astronauts, nationality WHERE (astronauts.english_name = '" + name + "' OR astronauts.original_name = '" + name + "') AND nationality.id = astronauts.nationality;"
            cursor.execute(query)
            for row in cursor:
                ID = str(row[0])
                en_name = row[1]
                og_name = row[2]
                nnum = row[3]
                sx = row[4]
                yb = row[5]
                nat = row[6]
                m_c = row[7]
                ys = row[8]
                t_m = row[9]
                t_m_h = row[10]
                t_e_h = row[11]
                nat = row[13]
                n_code = row[14]
                break
            query = "SELECT astronaut_mission.id, astronaut_mission.mission, missions.title, astronaut_mission.occupation, astronaut_mission.eva_hours, astronaut_mission.mission_num, astronaut_mission.selection FROM astronaut_mission, astronauts, missions WHERE astronauts.id = " + ID + " AND astronaut_mission.astronaut = astronauts.id AND astronaut_mission.mission = missions.id;"
            cursor.execute(query)
            for row in cursor:
                print(row)
                a_mID = str(row[0])
                missionID = str(row[1])
                mission_title = row[2]
                occupation = row[3].capitalize()
                eva_h = str(row[4])
                ord_mission_num = str(row[5])
                astronaut_group = row[6]
                missions_html += '''<h2><a href="/api/profile/?name={}">{}</a>: Missions ID-{} Astronaut_Mission ID-{}</h2>\
                    <table>\
                        <tr><th>Occupation on Mission:</th><td>{}</td></tr>\
                        <tr><th>Extravehicular Hours on Mission:</th><td>{}</td></tr>\
                        <tr><th>{}'s Mission Number:</th><td>{}</td></tr>\
                        <tr><th>Selection Group for Mission:</th><td>{}</td></tr>\
                    </table>'''.format(mission_title, mission_title, missionID, a_mID, occupation, eva_h, en_name, ord_mission_num, astronaut_group)
            with open('./templates/astro_prof.html', 'w') as file:
                file.write(missions_html)
        except Exception as e:
            print(e, file=sys.stderr)
        page = flask.render_template('astronaut_profile.html', id=ID, english_name=en_name, original_name=og_name, nwnumber=nnum, sex=sx, yob=yb, natID=nat, mil_civ=m_c, yos=ys, total_missions=t_m, total_mission_hours=t_m_h, total_eva_hours=t_e_h, nation=nat, code=n_code, missions='astro_prof.html')
        os.remove('./templates/astro_prof.html')
        return page
    elif name in search_set['missions']:
        astronauts_html = ''
        try:
            connection = get_connection()
            cursor = connection.cursor()
            query = "SELECT * FROM missions WHERE title = '" + name + "';"
            cursor.execute(query)
            for row in cursor:
                ID = str(row[0])
                titl = row[1]
                m_y = row[2]
                asc = row[3]
                orb = row[4]
                dec = row[5]
                dur = row[6]
                comb_eva = row[7]
                comp = row[8]
                break
            query = "SELECT astronaut_mission.id, astronaut_mission.astronaut, astronauts.english_name, astronaut_mission.occupation, astronaut_mission.eva_hours, astronaut_mission.mission_num, astronaut_mission.selection, astronauts.original_name FROM astronaut_mission, astronauts, missions WHERE missions.id = " + ID + " AND astronaut_mission.astronaut = astronauts.id AND astronaut_mission.mission = missions.id;"
            cursor.execute(query)
            for row in cursor:
                print(row)
                a_mID = str(row[0])
                astronautID = str(row[1])
                en_name = row[2]
                occupation = row[3].capitalize()
                eva_h = str(row[4])
                ord_mission_num = str(row[5])
                astronaut_group = row[6]
                og_name = row[7]
                astronauts_html += '''<h2><a href="/api/profile/?name={}">{}</a> ({}): Astronauts ID-{} Astronaut_Mission ID-{}</h2>\
                    <table>\
                        <tr><th>Occupation on Mission:</th><td>{}</td></tr>\
                        <tr><th>Extravehicular Hours on Mission:</th><td>{}</td></tr>\
                        <tr><th>{}'s Mission Number:</th><td>{}</td></tr>\
                        <tr><th>Selection Group for Mission:</th><td>{}</td></tr>\
                    </table>'''.format(en_name, en_name, og_name, astronautID, a_mID, occupation, eva_h, en_name, ord_mission_num, astronaut_group)
            with open('./templates/missn_prof.html', 'w') as file:
                file.write(astronauts_html)
        except Exception as e:
            print(e, file=sys.stderr)
        page = flask.render_template('mission_profile.html', id=ID, title=titl, mission_year=m_y, ascent=asc, orbit=orb, decent=dec, duration=dur, combined_eva=comb_eva, composition=comp, astronauts='missn_prof.html')
        os.remove('./templates/missn_prof.html')
        return page
    elif name in search_set['crafts']:
        missions_html = ''
        try:
            connection = get_connection()
            cursor = connection.cursor()
            query = "SELECT * FROM missions WHERE ascent = '" + name + "' OR orbit = '" + name + "' OR decent = '" + name + "';"
            cursor.execute(query)
            for row in cursor:
                ID = str(row[0])
                titl = row[1]
                m_y = row[2]
                asc = row[3]
                orb = row[4]
                dec = row[5]
                dur = row[6]
                comb_eva = row[7]
                comp = row[8]
                missions_html += '''<h2><a href="/api/profile/?name={}">{}</a>: Missions ID-{}</h2>\
                    <table>\
                        <tr><th>Mission Year:</th><td>{}</td></tr>\
                        <tr><th>Ascent Craft:</th><td><a href="/api/profile/?name={}">{}</a></td></tr>\
                        <tr><th>Orbit Craft:</th><td><a href="/api/profile/?name={}">{}</a></td></tr>\
                        <tr><th>Decent Craft:</th><td><a href="/api/profile/?name={}">{}</a></td></tr>\
                        <tr><th>Duration:</th><td>{}</td></tr>\
                        <tr><th>Combined Astronaut Extravehicular Time:</th><td>{}</td></tr>\
                        <tr><th>Millitary/Civillian Composition of Crew:</th><td>{}</td></tr>\
                    </table>'''.format(titl, titl, ID, m_y, asc, asc, orb, orb, dec, dec, dur, comb_eva, comp)
            with open('./templates/craft_prof.html', 'w') as file:
                file.write(missions_html)
        except Exception as e:
            print(e, file=sys.stderr)
        page = flask.render_template('craft_profile.html', craft=name, missions='craft_prof.html')
        os.remove('./templates/craft_prof.html')
        return page
    else:
        flask.abort(404)

def get_other(other):
    '''Return proper operators to prevent SQL injection.'''
    if '!=' in other:
        return '!='
    elif '>=' in other:
        return '>='
    elif '<=' in other:
        return '<='
    elif '>' in other:
        return '>'
    elif '<' in other:
        return '<'
    elif '=' in other:
        return '='
    elif 'AND' in other:
        return 'AND'
    elif 'OR' in other:
        return 'OR'


def parseWhere(where):
    '''Parse the inputted WHERE clause to try and prevent SQL injection.'''
    where = where.split(' ')
    query = ''
    while where:
        a = get_list(where[0].casefold())
        b = get_other(where[1])
        c = get_list(where[2].casefold())
        if c == -1 :
            c = "'{}'".format(where[2].replace("'", "''").replace(";", ""))
        query += '{} {} {} '.format(a, b, c)
        if len(where) > 3:
            query += '{} '.format(get_other(where[3].upper()))
            where = where[4:]
        else:
            break
    return query

@api.route('/graphing/')
def get_graph():
    '''
    Return a list of x, y values to that can be used to make a chart.
    Takes optional operators for x (default is nationality.nation),
    y (default is astronauts.id), aggregate (default is COUNT), 
    order (default is '') and query (default is '').
    '''
    table.clear()
    x = flask.request.args.get('x', 'nationality.nation').casefold()
    y = flask.request.args.get('y', 'astronauts.id').casefold()
    aggregation = flask.request.args.get('aggregate', 'COUNT').upper()
    order = flask.request.args.get('order', '').upper()
    where = flask.request.args.get('query', '')
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
    if where:
        where = 'WHERE ' + parseWhere(where)

    query = 'SELECT ' + aggregation + '(' + y + '), ' + x + ' FROM ' + ', '.join(table) + ' ' + where + 'GROUP BY ' + x + ' ORDER BY ' + aggregation + '(' + y + ') ' + order + ';'
    graph_list = []
    try:
        connection = get_connection()
        cursor = connection.cursor()
        cursor.execute(query)
        for row in cursor:
            entry = {'x':str(row[1]), 'y':str(row[0])}
            graph_list.append(entry)
        cursor.close()
        connection.close()
    except Exception as e:
        print(e, file=sys.stderr)
    return json.dumps(graph_list)