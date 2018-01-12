import React, { Component } from 'react';
import {
  View,
  Text,
  FlatList,
  PanResponder,
  Animated,
  Dimensions
} from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width
const SWIPE_THRESHOLD = 0.25 * SCREEN_WIDTH
const SWIPE_OUT_DURATION = 250

class Deck extends Component {
  constructor(props) {
    super(props)
    // default card position
    const position = new Animated.ValueXY()
    // define instance of PanResponder
    const panResponder = PanResponder.create({
      // when user clicks down on the screen
      onStartShouldSetPanResponder: () => true,
      // when user drags finger around on the screen
      onPanResponderMove: (event, gesture) => {
        // console.log(gesture)
        // manually update card position, gesture object has dx and dy properties that tell how user has moved finger
        position.setValue({ x: gesture.dx, y: gesture.dy })
      },
      // when user releases finger from the screen
      onPanResponderRelease: (event, gesture) => {
        // if swipe right beyond threshold
        if (gesture.dx > SWIPE_THRESHOLD) {
          // console.log("Swipe right")
          this.forceSwipe('right')
        }
        // if swipe left beyond -threshold
        else if (gesture.dx < -SWIPE_THRESHOLD) {
          // console.log("Swipe right")
          this.forceSwipe('left')
        }
        else {
          // move card to default position
          this.resetPosition()
        }
      }
    })
    // give component access to panResponder
    // actually dont need to use state, because pan and animation are independent of state,
    // we can just do this.panResponder = panResponder and then access it
    this.state = {
      panResponder,
      position
    }
  }

  /*
  renderCards = () => {
    // take list of data passed in and pass it to renderCard method which was also passed in. WOW
    // full circle to take input and output both from props
    return this.props.data.map((item) => {
      return this.props.renderCard(item)
    })
  }
  */

  forceSwipe = (direction) => {
    // direction value
    const xValue = (direction === 'right') ? SCREEN_WIDTH : -SCREEN_WIDTH
    // transition card out of the screen
    Animated.timing(this.state.position, {
      toValue: { x: xValue, y: 0 },
      duration: SWIPE_OUT_DURATION
    }).start(() => this.onSwipeCompelete(direction))
  }

  onSwipeCompelete = (direction) => {
    const { onSwipeLeft, onSwipeRight } = this.props
    // execute function based on direction
    (direction === 'right') ? onSwipeRight() : onSwipeLeft()
  }

  resetPosition = () => {
    // move card back to default position
    Animated.spring(this.state.position, {
      toValue: { x: 0, y: 0 }
    }).start()
  }

  getCardStyle = () => {
    const { position } = this.state
    // interpolate to connect position and rotation of object

    const rotate = position.x.interpolate({
      inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
      outputRange: ['-90deg', '0deg', '90deg']
    })

    return {
      ...position.getLayout(),
      transform: [{ rotate }]
    }
  }

  render() {
    return (
      <View>
      <FlatList
        data={this.props.data}
        renderItem={({ item, index }) => {
          if (index === 0) {
            return (
              <Animated.View
                {...this.state.panResponder.panHandlers}
                style={this.getCardStyle()}
              >
                {this.props.renderCard(item)}
              </Animated.View>
            )
          }
          // if not first card
          return this.props.renderCard(item)
        }}
        keyExtractor={(item) => item.id}
      />
      </View>
    );
  }
}

export default Deck;
