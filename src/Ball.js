import React, { Component } from 'react';
import {
  View,
  Text,
  Animated
} from 'react-native';

class Ball extends Component {
  componentWillMount() {
    // initialize the starting position of the element to be animated, ValueXY is the current position of the animated object at any point
    this.position = new Animated.ValueXY(0, 0)
    // take ValueXY and move this.position to x:200 y:500 and start it asap
    Animated.spring(this.position, {
      toValue: { x: 200, y: 500 },
    }).start()
  }

  render() {
    return (
      <Animated.View style={this.position.getLayout()}>
      <View style={styles.ball}/>
      </Animated.View>
    );
  }
}

const styles = {
  ball: {
    height: 60,
    width: 60,
    borderRadius: 30,
    borderWidth: 30,
    borderColor: 'black'
  }
}

export default Ball;
