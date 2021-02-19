'''astronauttests.py
   Etienne Richart, 18 Feb 2021
'''

import unittest
import json

class AstronautTester(unittest.TestCase):
    def setUp(self):
        self.baseURL = "http://localhost:5001/"

    def tearDown(self):
        pass

    def test_features(self):
        response = json.loads(features())
        self.assertEqual(len(response), 32)
        testedA = False
        testedB = False
        for x in range(32):
            if response[x].name == "Name":
                self.assertEqual(response[x].raw, "astronaut")
                self.assertEqual(response[x].type, "string")
                testedA = not testedA
            if response[x].name == "Mission Num":
                self.assertEqual(response[x].raw, "neither")
                self.assertEqual(response[x].type, "integer")
                testedB = not testedB
        self.assertTrue(testedA)
        self.assertTrue(testedB)

    def test_astronauts_raw(self):
        response = json.loads(astronauts_raw())
        self.assertEqual(len(vars(response[0])), 20)
        self.assertNotEqual(response[0].name, "NA")
    
    def test_astronauts_raw(self):
        response = int(json.loads(astronauts_raw_max()))
        self.assertEqual(response, 565)

    def test_astronauts_raw(self):
        features = "english_name|nationality|yos"
        sort = "yob"
        show = "5"
        response = json.loads(astronauts_raw_max(features, sort, show))
        self.assertEqual(response, 565)

    def test_missions_raw(self):
        response = json.loads(missions_raw())
        self.assertEqual(len(vars(response[0])), 10)
        self.assertNotEqual(response[0].title, "NA")
    
    def test_missions_raw(self):
        response = int(json.loads(missions_raw_max()))
        self.assertEqual(response, BLANK)

    def test_missions_raw(self):
        features = "title|mission_year|orbit"
        sort = "duration|decent"
        show = "5"
        response = json.loads(missions_raw_max(features, sort, show))
        self.assertEqual(response.title, BLANK)
    
    def test_astronauts_list_name(self):
        response = json.loads(astronauts_list_name())
        self.assertEqual(len(response), 565)

    def test_astronauts_list_year(self):
        response = json.loads(astronauts_list_year())
        self.assertEqual(len(response), 565)
        less = response[0].yos <= response[1].yos
        self.assertTrue(less)

    def test_missions_list_name(self):
        response = json.loads(missions_list_name())
        self.assertEqual(len(response), BLANK)

    def test_missions_list_year(self):
        response = json.loads(missions_list_year())
        self.assertEqual(len(response), BLANK)
        less = response[0].mission_year <= response[1].mission_year
        self.assertTrue(less)
    
    def test_astronauts_profile(self):
        name = "Yuri Gagarin"
        response = json.loads(astronaut_profile(name))
        self.assertEqual(response.english_name, "Yuri Gagarin")
    
    def test_missions_profile(self):
        title = "Apollo 11"
        response = json.loads(mission_profile(title))
        self.assertEqual(response.title, "Apollo 11")

    def test_search(self):
        query = "Apollo 11"
        response = json.loads(search(query))
        self.assertEqual(response.title, query)
        self.assertEqual(response.link, 'missions/{}'.format(query))

if __name__ == '__main__':
    unittest.main()

