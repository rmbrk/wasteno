const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// from https://github.com/RideAmigosCorp/mongoose-geojson-schema/blob/0c904a6f0e8e3e312d02151a665b79b2beb42a4b/index.js#L77
class Point extends mongoose.SchemaType {
  constructor(key, options) {
    super();
    mongoose.SchemaType.call(this, key, options, 'Point');
  }
  static get schemaName() { return 'Point'; }

  validatePoint(coordinates) {
    if (!(coordinates instanceof Array)) {
      throw new mongoose.Error(`Point ${coordinates} must be an array`);
    }
    // must have 2/3 points
    if (coordinates.length < 2 || coordinates.length > 3) {
      throw new mongoose.Error(`Point ${coordinates} must contain two or three coordinates`);
    }
    // must have two numbers
    if (typeof coordinates[0] !== 'number' || typeof coordinates[1] !== 'number') {
      throw new mongoose.Error('Point must have two numbers');
    }
    // longitude must be within bounds
    if (coordinates[0] > 180 || coordinates[0] < -180) {
      throw new mongoose.Error(`Point${coordinates[0]} should be within the boundaries of longitude`);
    }
    // latitude must be within bounds
    if (coordinates[1] > 90 || coordinates[1] < -90) {
      throw new mongoose.Error(`Point${coordinates[1]} should be within the boundaries of latitude`);
    }
  }

  cast(point) {
    if (!point.type) {
      throw new mongoose.Error('Point', point.type, 'point.type');
    }
    // type must be Point
    if (point.type !== 'Point') {
      throw new mongoose.Error(`${point.type} is not a valid GeoJSON type`);
    }
    this.validatePoint(point.coordinates);
    return point;
  }
}
mongoose.Schema.Types.Point = Point;
mongoose.Types.Point = Point;


module.exports = {
  ref: name => ({
    type: mongoose.Schema.Types.ObjectId,
    ref: name,
  }),
  idRef: id => mongoose.Types.ObjectId(id),
  common: {
    statics: {
      findByPasswordAndUsername({ password, username }, cb) {
        this.findOne({ username }, async (err, user) => {
          if (!user) {
            return cb(null);
          }

          const passwordsMatch = await bcrypt.compare(password, user.hash);

          return cb(passwordsMatch ? user : null);
        });
      },
    },
  },
  model: mongoose.model.bind(mongoose),
  types: {
    Point,
  },
};

