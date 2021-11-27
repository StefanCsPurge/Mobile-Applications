import dataStore from 'nedb-promise';

export class MovieStore {
  constructor({ filename, autoload }) {
    this.store = dataStore({ filename, autoload });
  }
  
  async find(props) {
    return this.store.find(props);
  }
  
  async findOne(props) {
    return this.store.findOne(props);
  }
  
  async insert(movie) {
    let movieTitle = movie.title;
    let movieYear = movie.year;
    if (!movieTitle) { // validation
      throw new Error('Missing text property')
    }
    // if (!movieYear) { // validation
    //   throw new Error('Missing text property')
    // }
    movie._id = undefined;
    console.log(movie)
    return this.store.insert(movie);
  };
  
  async update(props, movie) {
    return this.store.update(props, movie);
  }
  
  async remove(props) {
    return this.store.remove(props);
  }
}

export default new MovieStore({ filename: './db/movies.json', autoload: true });