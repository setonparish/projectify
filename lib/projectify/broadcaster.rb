module Projectify
  class Broadcaster
    attr_accessor :projectors

    def initialize(addresses = Projectify.configuration.projector_addresses)
      @projectors = addresses.map do |address|
        Projector.new(address)
      end
    end

    def call(command)
      hsh = {}
      projectors.each do |projector|
        hsh[projector.address] = projector.send(command)
      end
      hsh
    end
  end
end