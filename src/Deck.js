import React, { Component } from 'react';
import {
  View,
  Text,
  FlatList,
  PanResponder,
  Animated,
  Dimensions,
  LayoutAnimation,
  UIManager,
} from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width
const SWIPE_THRESHOLD = 0.25 * SCREEN_WIDTH
const SWIPE_OUT_DURATION = 250

class Deck extends Component {
  // when component is rendered, it checks here to see if required props were provided
  static defaultProps = {
    onSwipeRight: () => {},
    onSwipeLeft: () => {}
  }

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
      position,
      index: 0,
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

  componentWillReceiveProps(nextProps) {
    if (nextProps.data !== this.props.data) {
      this.setState({ index: 0 })
    }
  }

  componentWillUpdate() {
    UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true)
    LayoutAnimation.spring()
  }

  forceSwipe = (direction) => {
    // direction value
    const xValue = (direction === 'right') ? SCREEN_WIDTH : -SCREEN_WIDTH
    // transition card out of the screen
    Animated.timing(this.state.position, {
      toValue: { x: xValue, y: 0 },
      duration: SWIPE_OUT_DURATION
    }).start(() => this.onSwipeComplete(direction))
  }

  onSwipeComplete = (direction) => {
    const { onSwipeLeft, onSwipeRight, data } = this.props
    const item = data[this.state.index]
    // move to next Card
    this.setState({ index: this.state.index + 1 })
    this.state.position.setValue({ x: 0, y: 0 })
    // execute function based on direction
    direction === 'right' ? onSwipeRight(item) : onSwipeLeft(item)
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

  // wrapper function to return element from flatlist, much needed
  renderCards = (item, i) => {
    console.log("Rendercards was run")
    // if no items left
    if (this.state.index >= this.props.data.length) {
      return this.props.renderNoMoreCards()
    }
    // if current state index is higher, don't show previous (already swiped) cards
    if (i < this.state.index) { return null }
    // if current state index matches current card in list
    if (i === this.state.index) {
      return (
        <Animated.View
          {...this.state.panResponder.panHandlers}
          style={[this.getCardStyle(), styles.cardStyle]}
        >
          {this.props.renderCard(item)}
        </Animated.View>
      )
    }
    // if rest of cards
    return (
      <Animated.View
        key={item.id}
        style={[styles.cardStyle, { top: 10 * (i - this.state.index) }]}
      >
        {this.props.renderCard(item)}
      </Animated.View>
    )
  }

  // MYSTERY = passing in state.index to extraData prop of FlatList made it rerender everytime

  render() {
    console.log("state index is", this.state.index)
    return (
      <FlatList
        data={this.props.data.reverse()}
        extraData={this.state.index}
        renderItem={({ item, index }) => this.renderCards(item, index)}
        keyExtractor={(item) => item.id}
      />
    );
  }
}

const styles = {
  cardStyle: {
    position: 'absolute',
    width: SCREEN_WIDTH,
  }
}

export default Deck;
