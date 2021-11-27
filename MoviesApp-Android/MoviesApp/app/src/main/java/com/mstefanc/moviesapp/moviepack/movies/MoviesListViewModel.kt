package com.mstefanc.moviesapp.moviepack.movies

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

class MoviesListViewModel(application: Application) : AndroidViewModel(application) {
    private val mutableLoading = MutableLiveData<Boolean>().apply { value = false }
    private val mutableException = MutableLiveData<Exception>().apply { value = null }

    val movies: LiveData<List<Movie>>
    val loading: LiveData<Boolean> = mutableLoading
    val loadingError: LiveData<Exception> = mutableException

    private val movieRepository: MovieRepository

    init {
        val movieDao = MoviepackDatabase.getDatabase(application, viewModelScope).movieDao()
        movieRepository = MovieRepository(movieDao)
        movies = movieRepository.movies
    }

    fun refresh() {
        viewModelScope.launch {
            Log.v(TAG, "refresh...")
            mutableLoading.value = true
            mutableException.value = null
            when (val result = movieRepository.refresh()) {
                is Result.Success -> {
                    Log.d(TAG, "refresh succeeded")
                }
                is Result.Error -> {
                    Log.w(TAG, "refresh failed", result.exception);
                    mutableException.value = result.exception
                }
            }
            mutableLoading.value = false
        }
    }

    fun emptyMovieLocalStorage() {
        viewModelScope.launch {
            movieRepository.deleteAllLocal()
        }
    }
}