module Projectify
  class Broadcaster
    attr_accessor :projectors

    def initialize(addresses = Projectify.configuration.projector_addresses)
      @projectors = addresses.map do |address|
        Projector.new(address)
      end
    end

    def all?(method)
      return false if projectors.empty?
      projectors.all? { |p| p.send(method) }
    end

    def any?(method)
      return false if projectors.empty?
      projectors.any? { |p| p.send(method) }
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