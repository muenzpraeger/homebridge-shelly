/* eslint-env mocha */

const shellies = require('shellies')
const should = require('should')

const Homebridge = require('./mocks/homebridge')
const log = require('./mocks/log')

const homebridge = new Homebridge()

const AccessoryFactory = require('../accessories/factory')(homebridge)
const getCategories = require('../util/categories')

describe('HAP compatibility', function() {
  afterEach(function() {
    shellies.removeAllDevices()
  })

  describe('util/categories', function() {
    it('should use hap.Categories (Homebridge 2.x)', function() {
      getCategories(homebridge).should.equal(homebridge.hap.Categories)
    })

    it('should fall back to Accessory.Categories (Homebridge 1.x)', function() {
      const legacy = { OTHER: 1 }
      const categories = getCategories({
        hap: { Accessory: { Categories: legacy } },
      })
      categories.should.equal(legacy)
    })
  })

  describe('accessory creation', function() {
    it('should set the category of new platform accessories', function() {
      const device = shellies.createDevice('SHSW-1', 'ABC123', '192.168.1.2')
      const accessory = AccessoryFactory.createAccessory(device, 0, {}, log)
      accessory.platformAccessory.category.should.equal(
        homebridge.hap.Categories.SWITCH
      )
    })

    it('should add a Battery service to battery powered devices', function() {
      const device = shellies.createDevice('SHHT-1', 'ABC124', '192.168.1.3')
      const accessory = AccessoryFactory.createAccessory(device, 0, {}, log)
      const pa = accessory.platformAccessory
      pa.category.should.equal(homebridge.hap.Categories.SENSOR)
      should(pa.getService(homebridge.hap.Service.Battery)).be.ok()
    })
  })
})
