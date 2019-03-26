RSpec.describe Projectify::Projector do

  let(:service) { described_class.new("127.0.0.1") }

  describe "#power_on" do
    it "sends the command" do
      expect(service).to receive(:call).with(POWER_ON)
      service.power_on
    end
  end

  describe "#power_off" do
    it "sends the command" do
      expect(service).to receive(:call).with(POWER_OFF)
      service.power_off
    end
  end

  describe "#power_status" do
    it "sends the command" do
      expect(service).to receive(:call).with(STATUS)
      service.power_status
    end
  end

  describe "#powered_on?" do
    context "when projector is on" do
      before do
        expect(service).to receive(:call).with(STATUS) { ">status running;error:cover&filter;warning:light\r\n" }
      end

      it "is true" do
        expect(service.powered_on?).to eq(true)
      end
    end

    context "when projector is off" do
      before do
        expect(service).to receive(:call).with(STATUS) { ">status standy;error:cover&filter;warning:light\r\n" }
      end

      it "is false" do
        expect(service.powered_on?).to eq(false)
      end
    end

    context "when projector is still warming up" do
      before do
        expect(service).to receive(:call).with(STATUS) { ">status warming;error:cover&filter;warning:light\r\n" }
      end

      it "is false" do
        expect(service.powered_on?).to eq(false)
      end
    end
  end

  describe "#powered_off?" do
    context "when projector is on" do
      before do
        expect(service).to receive(:call).with(STATUS) { ">status running;error:cover&filter;warning:light\r\n" }
      end

      it "is false" do
        expect(service.powered_off?).to eq(false)
      end
    end

    context "when projector is off" do
      before do
        expect(service).to receive(:call).with(STATUS) { ">status standby;error:cover&filter;warning:light\r\n" }
      end

      it "is true" do
        expect(service.powered_off?).to eq(true)
      end
    end

    context "when projector is still cooling" do
      before do
        expect(service).to receive(:call).with(STATUS) { ">status cooling;error:cover&filter;warning:light\r\n" }
      end

      it "is false" do
        expect(service.powered_off?).to eq(false)
      end
    end
  end

  #
  # Although this is a private method, it is intentionally being
  # tested to increase comfort of correct command handling and
  # simplify the test setup of other public methods that call it.
  #
  describe "#call" do
    let(:physical_response) { "> ok\r\n" }
    let(:physical_projector) do
      double(:physical_projector, puts: nil, gets: physical_response, close: nil)
    end

    before do
      allow(TCPSocket).to receive(:new) { physical_projector }
    end

    it "sends command to physical projector" do
      command = "my command"
      response = service.send(:call, "my command")
      expect(response).to eq("> ok")
    end

    it "closes the socket" do
      command = "my command"
      expect(physical_projector).to receive(:close)
      service.send(:call, "my command")
    end
  end
end
