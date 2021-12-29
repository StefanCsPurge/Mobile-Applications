package com.mstefanc.moviesapp.moviepack.data

import com.mstefanc.moviesapp.moviepack.data.workers.UpdateWorker
import androidx.lifecycle.LiveData
import com.mstefanc.moviesapp.core.Result
import com.mstefanc.moviesapp.moviepack.data.local.MovieDao
import com.mstefanc.moviesapp.moviepack.data.remote.MovieApi
import android.util.Log
import androidx.appcompat.app.AppCompatActivity
import androidx.work.*
import com.mstefanc.moviesapp.core.TAG
import com.mstefanc.moviesapp.moviepack.data.workers.DeleteWorker

class MovieRepository(private val movieDao: MovieDao) : AppCompatActivity() {

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
//            if(movieDao.getAll().value!!.isNotEmpty())
//                Result.Success(true)
            Result.Error(e)
        }
    }

    fun getById(movieId: String): LiveData<Movie> {
        return movieDao.getById(movieId)
    }

    suspend fun delete(movie: Movie) {
        try {
            movieDao.delete(movie)
            MovieApi.service.delete(movie._id)
        } catch(e: Exception) {
            startAndObserveJob(movie, "delete")
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
            // startAndObserveJob(movie, "save")
            Result.Error(e)
        }
    }

    suspend fun update(movie: Movie): Result<Movie> {
        return try {
            movieDao.update(movie)
            val updatedMovie = MovieApi.service.update(movie._id, movie)
            Result.Success(updatedMovie)
        } catch(e: Exception) {
            startAndObserveJob(movie, "update")
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

    private fun startAndObserveJob(movie: Movie, jobType: String) {
        val constraints = Constraints.Builder()
            .setRequiredNetworkType(NetworkType.CONNECTED)
            .build()
        val inputData = Data.Builder()
            .putString("id", movie._id)
            .putString("title", movie.title)
            .putString("year", movie.year.toString())
            .build()
//        val myWork = PeriodicWorkRequestBuilder<ExampleWorker>(1, TimeUnit.MINUTES)

        var theWork = OneTimeWorkRequest.Builder(UpdateWorker::class.java)
            .setConstraints(constraints)
            .setInputData(inputData)
            .build()

        if (jobType == "delete") {
            theWork = OneTimeWorkRequest.Builder(DeleteWorker::class.java)
                .setConstraints(constraints)
                .setInputData(inputData)
                .build()
        }

        val workId = theWork.id
        WorkManager.getInstance(this).apply {
            // enqueue Work
            enqueue(theWork)
            // observe work status
            getWorkInfoByIdLiveData(workId)
                .observe(this@MovieRepository, { status ->
                    val isFinished = status?.state?.isFinished
                    Log.d(TAG, "Job $workId; finished: $isFinished")
                })
        }
    }
}