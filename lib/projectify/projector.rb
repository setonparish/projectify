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

    def status
      {
        power: call(POWER_STATUS)
      }
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