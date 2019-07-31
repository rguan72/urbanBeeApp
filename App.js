import React from 'react';
import { StyleSheet, Text, View, Button, Image, ScrollView, TouchableOpacity } from 'react-native';
import { createStackNavigator, createAppContainer, NavigationEvents } from 'react-navigation';
import * as firebase from 'firebase';

const firebaseConfig = {
  apiKey: "AIzaSyCwKCQcyndHIGF1x0MRLiQLfHkRXUjUGgM",
  authDomain: "urbanbee-8b6d6.firebaseapp.com",
  databaseURL: "https://urbanbee-8b6d6.firebaseio.com",
  projectId: "urbanbee-8b6d6",
  storageBucket: "urbanbee-8b6d6.appspot.com",
  messagingSenderId: "721840806856",
  appId: "1:721840806856:web:0451e68d6d5d3b6f"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

class HomeScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hiveIds: [] };

    this.addHive = this.addHive.bind(this); // More react bindings so you can have access to the class's 'this'
  }

  componentDidMount() {
    database
      .ref('users/1/hiveIds')
      .once('value')
      .then((data) => {
        // don't forget about toJSON (always important in web dev)
        this.setState({hiveIds: Object.keys(data.toJSON())})
      })
      .catch((error) => {
        console.log(error);
      })
  }

  addHive() {
    let newHiveKey = database.ref('users/1/hiveIds').push().key;
    database.ref('users/1/hiveIds').child(newHiveKey).set('filler');
    database.ref('hives').update({
      [newHiveKey]: {
        date_updated: 0,
        time_updated: 0,
        temp: 0,
        humidity: 0, 
        weight: 0,
        userId: 1,
        name: 'New Hive',
      }
    })
    let joined = this.state.hiveIds.concat(newHiveKey);
    this.setState({ hiveIds: joined });
  }

  render() {
    const { navigate } = this.props.navigation
    let hiveList = this.state.hiveIds.map((id) => 
      <PersonalHive
        hiveName = 'Cool Hive'
        hiveId = {id}
        key = {id}
        navigate = {navigate}
      />
    )
    return (
      <View style={styles.container}>
        <ScrollView>
          <View>
            <Image
              source={require('./assets/top-bar.png')}
              style={styles.topBar}
            />
          </View>
          {hiveList}
        </ScrollView>
        <View style={[styles.alignEnd]}>
          <TouchableOpacity onPress={this.addHive}>
            <Image
              source={require('./assets/add.png')}
              style={[styles.marRight, styles.absolutePosition]}
            /> 
          </TouchableOpacity>
        </View>
      </View>
    )   
  }
}

class PersonalHive extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      date_updated: null,
      time_updated: null
    }
  }
  componentDidMount() {
    database
      .ref('hives/' + this.props.hiveId)
      .on('value', (snapshot) => { // react BINDINGS ... this refers to ... can get around it with anonymous functions
        let data = snapshot.val()
        this.setState({ 
          time_updated: data.time_updated,
          date_updated: data.date_updated,
          hiveName: data.name, 
        })
      }, (error) => {
        console.log(error)
      })
  }
  render() {
    return (
      <View style={styles.marAll}>
        <Text style={[styles.orange, styles.header, styles.mar1]}> {this.state.hiveName} </Text>
        <View style={styles.flexRow}>
          <View>
            <Image
              source={require('./assets/beehivebee.png')}
              style={styles.marRight}
            />
          </View>
          <View style={[styles.marTop, styles.marRight]}>
            <Text> Checked {this.state.date_updated} </Text>
            <Text> at {this.state.time_updated} </Text>
            <View style={[styles.marTop, styles.width100]}>
              <Button
                title="More"
                color="#F7941D"
                onPress={() => this.props.navigate('Hive', {hiveId: this.props.hiveId})}
              />
            </View>
          </View>
        </View>
      </View>
    )
  }
}

class HiveScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      temp: null,
      weight: null,
      humidity: null,
      name: null
    }
  }
  componentDidMount() {
    database
      .ref('hives/' + this.props.navigation.state.params.hiveId)
      .on('value', (snapshot) => {
        let data = snapshot.val();
        this.setState({
          temp: data.temp,
          weight: data.weight,
          humidity: data.humidity,
          hiveName: data.name,
        })
      }, (error) => {
        console.log(error)
      })
  }
  render() {
    return (
      <View>
        <View>
          <Image
            source={require('./assets/top-bar.png')}
            style={styles.topBar}
          />
        </View>
        <Text style={styles.marAll}> {this.state.hiveName} </Text>
        <View style={{justifyContent: 'center'}}>
          <Text> Overall Hive Health </Text>
        </View>
        <Text> Temperature: {this.state.temp} </Text>
        <Text> Weight: {this.state.weight} </Text>
        <Text> Humidity: {this.state.humidity} </Text> 
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  flexRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start'
  },
  alignEnd: {
    alignItems: 'flex-end'
  },
  absolutePosition: {
    position: 'absolute'
  },
  width100: {
    flexGrow: 0,
    width: 100
  },
  topBar: {
    width: 410,
    height: 230,
    marginBottom: 10
  },
  orange: {
    color: '#F7941D',
  },
  orangeBackground: {
    backgroundColor: '#F7941D',
    zIndex: -99
  },
  header: {
    fontSize: 25
  },
  mar1: {
    marginTop: 10,
    marginBottom: 10
  },
  marAll: {
    marginLeft: 30,
    marginRight: 30,
    marginBottom: 30,
    marginTop: 15,
  },
  marRight: {
    marginRight: 25,
  },
  marTop: {
    marginTop: 10,
  }
});


const MainNavigator = createStackNavigator({
  Home: {screen: HomeScreen, navigationOptions: { header: null }},
  Hive: {screen: HiveScreen}
})

const App = createAppContainer(MainNavigator)

export default App;
