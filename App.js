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

    var ref = database.ref('hives')
    var usersRef = ref.child("users");
    usersRef.set({
      alanisawesome: {
        date_of_birth: "June 23, 1912",
        full_name: "Alan Turing"
      },
      gracehop: {
        date_of_birth: "December 9, 1906",
        full_name: "Grace Hopper"
      }
    });
    ref.on("value", function(snapshot) {
      console.log(snapshot.val());
    }, function (errorObject) {
      console.log("The read failed: " + errorObject.code);
    });
    return (
      <View style={styles.container}>
        <Text>Open up App.js to start working on your app!</Text>
        <PersonalHive
          hiveName='Cool Hive'
          navigate={navigate}
        />
      </View>
    )   
  }
}

class PersonalHive extends React.Component {
  componentDidMount() {
    database
      .ref('hives/' + this.props.hiveName)
      .on('value', function(snapshot) {
        this.state = snapshot.val()
      })
  }
  render() {
    return (
      <View>
        <Text> Hive {this.props.hiveName} </Text>
        <Text> Temperature: {this.state.temperature} </Text>
        <Weight> Weight: {this.state.weight} </Weight>
        <Button
          title="Live Monitoring"
          onPress={() => this.props.navigate('Hive', {name: this.props.hiveName})}
        />

      </View>
    )
  }
}

class HiveScreen extends React.Component {
  render() {
    return (
      <View>
        <Text> Hive {this.props.navigation.state.params.name} </Text>
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
