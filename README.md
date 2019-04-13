# Projectify

The Projectify Ruby library provides convenient access to common functionality of NEC-made projectors for applications written in the Ruby language. It uses the ASCII character interface across the local area network.

Although NEC projectors often have a web interface available to perform similar functions, this library allows the same command to be broadcast to multiple projectors, thereby allowing all specified projectors to stay in sync.

## Documentation

See the `docs` folder of this repository for API information.  Specifically, the common_ascii_e-r1.pdf provides the best reference.

### Requirements

* Ruby 2.0+.

### Bundler

Add the following to your `Gemfile`:

``` ruby
gem 'projectify', git: "git://github.com/setonparish/projectify"
```

## Usage

``` ruby
require 'projectify'

# configure projectors addresses
Projectify.configure do |config|
  config.projector_addresses = ["127.0.0.50", "127.0.0.99"]
end

# send command to multiple projectors
broadcaster = Projectify::Broadcaster.new
broadcaster.call(:power_off) # { "127.0.0.50" => ">ok", "127.0.0.99" => ">ok" }
broadcaster.call(:power_on)
broadcaster.call(:power_status)

# check status on multiple projectors
broadcaster = Projectify::Broadcaster.new
broadcaster.all?(:powered_on?)
broadcaster.any?(:powered_off?)
broadcaster.all?(:power_transitioning?) # warming or cooling, but not yet in final state
```

## Development

After checking out the repo, run `bin/setup` to install dependencies. Then, run `rake spec` to run the tests. You can also run `bin/console` for an interactive prompt that will allow you to experiment.

To install this gem onto your local machine, run `bundle exec rake install`. To release a new version, update the version number in `version.rb`, and then run `bundle exec rake release`, which will create a git tag for the version, push git commits and tags, and push the `.gem` file to [rubygems.org](https://rubygems.org).

## Contributing

Bug reports and pull requests are welcome on GitHub at https://github.com/setonparish/projectify.

## License

The gem is available as open source under the terms of the [MIT License](https://opensource.org/licenses/MIT).
