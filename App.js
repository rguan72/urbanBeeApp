import React from 'react';
import { StyleSheet, Text, View, Button, Image, ImageBackground, ScrollView, TouchableOpacity, ProgressBarAndroid } from 'react-native';
import { createStackNavigator, createAppContainer, NavigationEvents } from 'react-navigation';
import * as firebase from 'firebase';
import * as firebaseConfig from './firebase-config.json';

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
      name: null,
      date_updated: null,
      time_updated: null
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
          swarm_risk: data.swarm_risk,
          varroa_mite: data.varroa_mite,
          queen_present: data.queen_present,
          date_updated: data.date_updated,
          time_updated: data.time_updated,
          overall_health: data.overall_health,
        })
      }, (error) => {
        console.log(error)
      })
  }
  // Watch out for PROP NAMES (will fail silently)
  render() {
    return (
      <View>
        <View>
          <Image
            source={require('./assets/top-bar.png')}
            style={[styles.topBar, styles.height200]}
          />
        </View>
        <View style={{justifyContent: 'center', alignItems: 'center'}}>
          <Text style={[styles.marTop, styles.orange, styles.header]}> Yo {this.state.hiveName} </Text>
        </View>
        <View style={{justifyContent: 'center', alignItems: 'center', color: 'orange'}}>
          <Text style={[styles.marTop, styles.orange, styles.marBot]}> Overall Hive Health </Text>
          <ImageBackground source={require('./assets/hexagon.png')} style={{width: 150, height: 130, justifyContent: 'center', alignItems: 'center'}}>
            <Text style={[styles.green, styles.header2]}> {this.state.overall_health}% </Text>
          </ImageBackground>
          <View style={[styles.orangeBackground, styles.roundedRectangle, styles.marTop, styles.center, styles.white]}>
            <Text style={styles.white}> Next checkup: </Text>
            <Text style={styles.white}> {this.state.date_updated} </Text>
            <Text style={styles.white}> {this.state.time_updated} </Text>
          </View>
        </View>
        <View style={[styles.flexRow, styles.marAll, styles.large]}>
          <View style={[styles.flexCol, styles.centerText]}>
            <Text opacity={.5}> Temperature </Text>
            <Text style={[styles.header, styles.marBot]}> {this.state.temp} </Text>
            <Text opacity={.5}> Weight </Text>
            <Text style={[styles.header, styles.marBot]}> {this.state.weight} </Text>
            <Text opacity={.5}> Humidity </Text>
            <Text style={[styles.header, styles.marBot]}> {this.state.humidity} </Text>
          </View>
          <View style={[styles.flexCol, styles.centerText]}>
            <Text opacity={.5}> Swarm Risk </Text>
            <Text style={[styles.header, styles.marBot]}> {this.state.swarm_risk} </Text>
            <Text opacity={.5}> Varroa Mite Threat </Text>
            <Text style={[styles.header, styles.marBot]}> {this.state.varroa_mite} </Text>
          </View>
        </View>
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
  flexCol: {
    flex: 1,
    flexDirection: 'column',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center'
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
  height200: {
    height: 200
  },
  topBar: {
    width: 410,
    height: 230,
    marginBottom: 10
  },
  orange: {
    color: '#F7941D',
  },
  green: {
    color: '#08CC53'
  },
  white: {
    color: '#FFFFFF'
  },
  orangeBackground: {
    backgroundColor: '#F7941D',
  },
  roundedRectangle: {
    borderRadius: 5,
    padding: 10
  },
  med: {
    fontSize: 14
  },
  large: {
    fontSize: 18,
  },
  header: {
    fontSize: 25
  },
  header2: {
    fontSize: 28
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
  },
  marBot: {
    marginBottom: 10
  },
  centerText: {
    textAlign: 'center'
  },
});


const MainNavigator = createStackNavigator({
  Home: {screen: HomeScreen, navigationOptions: { header: null }},
  Hive: {screen: HiveScreen}
})

const App = createAppContainer(MainNavigator)

export default App;
