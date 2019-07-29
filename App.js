import React from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
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

  render() {
    const { navigate } = this.props.navigation
    // let hiveIds = []
    // database
    //   .ref('users/' + this.props.userId)
    //   .on('child_added', (data) => {
    //     hiveIds = data;
    // })
    console.log(hiveIds)
    return (
      <View style={styles.container}>
        <Text>Your Hives </Text>
        <PersonalHive
          hiveName='Cool Hive'
          hiveId = '-LkwlsGCeRtgzJ5NJnx6'
          userId = {1}
          navigate={navigate}
        />
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
          date_updated: data.date_updated 
        })
      })
  }
  render() {
    return (
      <View>
        <Text> Hive {this.props.hiveName} </Text>
        <Text> Date Updated: {this.state.date_updated} </Text>
        <Text> Time Updated: {this.state.time_updated} </Text>
        <Button
          title="Live Monitoring"
          onPress={() => this.props.navigate('Hive', {name: this.props.hiveName, hiveId: this.props.hiveId, userId: this.props.userId})}
        />

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
      humidity: null
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
          humidity: data.humidity
        })
      })
  }
  render() {
    return (
      <View>
        <Text> Hive {this.props.navigation.state.params.name} </Text>
        <Text> Temperature: {this.state.temp} </Text>
        <Text>Weight: {this.state.weight} </Text>
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
    justifyContent: 'center',
  },
});


const MainNavigator = createStackNavigator({
  Home: {screen: HomeScreen},
  Hive: {screen: HiveScreen}
})

const App = createAppContainer(MainNavigator)

export default App;
