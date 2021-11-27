package com.mstefanc.moviesapp.moviepack.movie

import android.app.Application
import android.util.Log
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.viewModelScope
import com.mstefanc.moviesapp.core.TAG
import com.mstefanc.moviesapp.core.Result
import com.mstefanc.moviesapp.moviepack.data.Movie
import com.mstefanc.moviesapp.moviepack.data.MovieRepository
import com.mstefanc.moviesapp.moviepack.data.local.MoviepackDatabase
import kotlinx.coroutines.launch

class MovieEditViewModel(application: Application) : AndroidViewModel(application) {
    private val mutableFetching = MutableLiveData<Boolean>().apply { value = false }
    private val mutableCompleted = MutableLiveData<Boolean>().apply { value = false }
    private val mutableException = MutableLiveData<Exception>().apply { value = null }
    val fetching: LiveData<Boolean> = mutableFetching
    val fetchingError: LiveData<Exception> = mutableException
    val completed: LiveData<Boolean> = mutableCompleted

    private val movieRepository: MovieRepository

    init {
        val movieDao = MoviepackDatabase.getDatabase(application, viewModelScope).movieDao()
        movieRepository = MovieRepository(movieDao)
    }

    fun getMovieById(movieId: String): LiveData<Movie> {
        Log.v(TAG, "getMovieById...")
        return movieRepository.getById(movieId)
    }

    fun saveOrUpdateMovie(movie: Movie) {
        viewModelScope.launch {
            Log.v(TAG, "saveOrUpdateMovie...")
            mutableFetching.value = true
            mutableException.value = null
            val result: Result<Movie> = if (movie._id.isNotEmpty()) {
                movieRepository.update(movie)
            } else {
                movieRepository.save(movie)
            }
            when(result) {
                is Result.Success -> {
                    Log.d(TAG, "saveOrUpdateMovie succeeded")
                }
                is Result.Error -> {
                    Log.w(TAG, "saveOrUpdateMovie failed", result.exception)
                    mutableException.value = result.exception
                }
            }
            mutableCompleted.value = true
            mutableFetching.value = false
        }
    }

    fun deleteMovie(movie: Movie){
        viewModelScope.launch {
            Log.v(TAG, "deleteMovie")
            mutableFetching.value = true
            movieRepository.delete(movie)
            mutableFetching.value = false
            mutableCompleted.value = true
        }
    }
}