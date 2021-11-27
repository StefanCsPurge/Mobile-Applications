package com.mstefanc.moviesapp.moviepack.data

import androidx.lifecycle.LiveData
import com.mstefanc.moviesapp.core.Result
import com.mstefanc.moviesapp.moviepack.data.local.MovieDao
import com.mstefanc.moviesapp.moviepack.data.remote.MovieApi
import android.util.Log
import com.mstefanc.moviesapp.core.TAG

class MovieRepository(private val movieDao: MovieDao) {

    val movies = movieDao.getAll()

    suspend fun refresh(): Result<Boolean> {
        return try {
            // movieDao.deleteAll()
            val movies = MovieApi.service.find()
            for (m in movies) {
                movieDao.insert(m)
            }
            Result.Success(true)
        } catch(e: Exception) {
            Result.Error(e)
        }
    }

    fun getById(movieId: String): LiveData<Movie> {
        return movieDao.getById(movieId)
    }

    suspend fun delete(movie: Movie) {
        try {
            MovieApi.service.delete(movie._id)
            movieDao.delete(movie)
        } catch(e: Exception) {
            Result.Error(e)
        }
    }

    suspend fun save(movie: Movie): Result<Movie> {
        return try {
            Log.i(TAG, "THE MOVIE MAN: " +  movie.title + " '" + movie._id + "' " + movie.year)
            val createdMovie = MovieApi.service.create(Movie("",movie.title,movie.year))
            movieDao.insert(createdMovie)
            Result.Success(createdMovie)
        } catch(e: Exception) {
            Result.Error(e)
        }
    }

    suspend fun update(movie: Movie): Result<Movie> {
        return try {
            val updatedMovie = MovieApi.service.update(movie._id, movie)
            movieDao.update(updatedMovie)
            Result.Success(updatedMovie)
        } catch(e: Exception) {
            Result.Error(e)
        }
    }

    suspend fun deleteAllLocal(){
        try {
            movieDao.deleteAll()
        } catch(e: Exception) {
            Result.Error(e)
        }
    }
}