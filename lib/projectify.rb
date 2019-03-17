require "projectify/version"
require "projectify/nec_commands"

require "projectify/projector"
require "projectify/broadcaster"

#
# Allow custom configuration from host application
#
module Projectify
  class << self
    attr_accessor :configuration
  end

  def self.configure
    self.configuration ||= Configuration.new
    yield(configuration)
  end

  class Configuration
    attr_accessor :projector_addresses

    #
    # Default values
    #
    def initialize
      @projector_addresses ||= (extract_projector_addresses || [])
    end

    private

    #
    # Allow projector network addresses to come from different
    # places depending on how library is being used.
    #
    def extract_projector_addresses
      # build from comma-separated ENV string
      if ENV["PROJECTOR_ADDRESSES"]
        return ENV["PROJECTOR_ADDRESSES"].split(",").map(&:strip)
      end
    end
  end
end

Projectify.configuration = Projectify::Configuration.new