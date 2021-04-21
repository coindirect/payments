import React, { Component } from 'react'
import secondsToHms from '../../Utils'

class Timer extends Component {
  constructor(props) {
    super()
    this.state = {
      minutes: 0,
      seconds: 0,
      hours: 0
    }
  }

  static getDerivedStateFromProps(props, state) {
    return state
  }

  timer = () => {
    this.timeInterval = setInterval(() => {
      const { miliseconds, timerExpiry, name, code } = this.props
      if (miliseconds) {
        const time = secondsToHms((miliseconds - new Date().getTime()) / 1000)
        this.setState({
          hours: time.hours,
          minutes: time.minutes,
          seconds: time.seconds
        })
        if (time.hours === 0 && time.minutes === 0 && time.seconds === 1) {
          timerExpiry && timerExpiry(code, name)
        }
      } else {
        const { seconds, minutes } = this.state
        if (seconds > 0) {
          this.setState(({ seconds }) => ({
            seconds: seconds - 1
          }))
        }
        if (seconds === 0) {
          if (minutes === 0) {
            clearInterval(this.timeInterval)
            this.setState({
              seconds: this.props.seconds,
              minutes: this.props.minutes
            })
            this.timer()
          } else {
            this.setState(({ minutes }) => ({
              minutes: minutes - 1,
              seconds: 59
            }))
          }
        }
      }
    }, 1000)
  }

  componentDidMount() {
    this.timer()
  }

  componentWillUnmount() {
    clearInterval(this.timeInterval)
  }

  render() {
    const { minutes, seconds, hours } = this.state
    return (
      <div>
        {minutes === undefined ||
        seconds === undefined ||
        hours === undefined ? (
          <span>00:00:00</span>
        ) : (
          <span>
            {' '}
            {hours < 10 ? `0${hours < 0 ? 0 : hours}` : hours}:
            {minutes < 10 ? `0${minutes < 0 ? 0 : minutes}` : minutes}:
            {seconds < 10 ? `0${seconds < 0 ? 0 : seconds}` : seconds}
          </span>
        )}
      </div>
    )
  }
}

export default Timer
