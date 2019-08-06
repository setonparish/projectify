require "socket"

module Projectify
  class Projector
    PORT = 7142
    CRLF = "\r\n"

    attr_reader :address

    def initialize(network_address)
      @address = network_address
    end

    def power_on
      call(POWER_ON)
    end

    def power_off
      call(POWER_OFF)
    end

    def power_status
      call(STATUS)
    end

    def shutter_open
      call(SHUTTER_OPEN)
    end

    def shutter_close
      call(SHUTTER_CLOSE)
    end

    def shutter_status
      call(SHUTTER_STATUS)
    end

    def busy?
      power_status.include?("busy")
    end

    def powered_on?
      power_status.include?("running")
    end

    def cooling_down?
      power_status.include?("cooling")
    end

    def warming_up?
      power_status.include?("warming")
    end

    def powered_off?
      power_status.include?("standby")
    end

    def shutter_open?
      shutter_status.include?("cur=open")
    end

    def shutter_close?
      shutter_status.include?("cur=close")
    end

    def power_transitioning?
      busy? || warming_up? || cooling_down?
    end

    private

    def call(command)
      socket = TCPSocket.new(@address, PORT)
      socket.puts(command + CRLF)
      response = socket.gets
      socket.close
      response.chomp
    end
  end
end