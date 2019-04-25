import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { selectLoading as selectGameLoading } from '../selectors/game';
import { selectLoading as selectScheduleLoading } from '../selectors/schedule';

const frames = [
  '⠋',
  '⠙',
  '⠹',
  '⠸',
  '⠼',
  '⠴',
  '⠦',
  '⠧',
  '⠇',
  '⠏'
];

class LoadingSpinner extends React.Component { 
  constructor(props) {
    super(props);
    this.state = {
      frame: 0,
      animating: false,
    };
  }

  componentDidMount() {
    this.doUpdate();
  }

  componentDidUpdate(prevProps, prevState) {
    const { gameLoading, scheduleLoading } = this.props;
    const { frame } = this.state;
    if (gameLoading !== prevProps.gameLoading || 
        scheduleLoading !== prevProps.scheduleLoading ||
        frame !== prevState.frame) {
      this.doUpdate();
    }
  }

  increment() {
    this.setState(state => ({
      frame: (state.frame + 1) % frames.length
    }));
  }

  doUpdate() {
    const { gameLoading, scheduleLoading } = this.props;
    const { animating, frame } = this.state;
    if (!animating && (gameLoading || scheduleLoading)) {
      this.setState({
        animating: true,
      });
      this.increment();
      this.timer = setInterval(() => this.increment(), 50);
    }
    if (!gameLoading && !scheduleLoading && frame === 0) {
      this.setState({
        animating: false,
      });
      clearInterval(this.timer);
    }
  }

  render() {
    const { animating, frame } = this.state;
    return <box content={animating ? frames[frame] : ' '} />;
  }
}

LoadingSpinner.propTypes = {
  gameLoading: PropTypes.bool,
  scheduleLoading: PropTypes.bool
};

const mapStateToProps = state => ({
  gameLoading: selectGameLoading(state),
  scheduleLoading: selectScheduleLoading(state),
});

export default connect(mapStateToProps)(LoadingSpinner);