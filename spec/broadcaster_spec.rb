RSpec.describe Projectify::Broadcaster do
  describe "#initialize" do
    it "assigns projector instances for broadcasting" do
      addresses = ["127.0.0.1", "127.0.0.2"]
      broadcaster = Projectify::Broadcaster.new(addresses)

      aggregate_failures do
        projectors = broadcaster.projectors
        expect(projectors.size).to eq(2)
        expect(projectors.first).to be_a(Projectify::Projector)
      end
    end
  end

  describe "#call" do
    before do
      Projectify.configuration.projector_addresses = ["127.0.0.1", "127.0.0.2"]
    end

    let(:service) { Projectify::Broadcaster.new }
    let(:command) { :power_on }

    it "sends command to all projectors" do
      expect(service.projectors[0]).to receive(command)
      expect(service.projectors[1]).to receive(command)
      service.call(command)
    end
  end
end
