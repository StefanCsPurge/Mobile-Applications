package com.mstefanc.moviesapp.moviepack.data.workers

import android.content.Context
import android.util.Log
import androidx.work.CoroutineWorker
import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.Dispatchers
import androidx.work.Data
import androidx.work.Worker
import androidx.work.WorkerParameters
import com.mstefanc.moviesapp.moviepack.data.Movie
import java.util.concurrent.TimeUnit.SECONDS
import com.mstefanc.moviesapp.moviepack.data.remote.MovieApi
import kotlinx.coroutines.launch

class UpdateWorker(
    context: Context,
    workerParams: WorkerParameters,
) : CoroutineWorker(context, workerParams) {
    private var wp = workerParams.inputData

    override suspend fun doWork(): Result {
        Log.i("PARAMS", wp.toString())
        val updatedMovie = Movie(wp.getString("id")!!,wp.getString("title")!!, wp.getString("year")!!.toInt())
        MovieApi.service.update(updatedMovie._id,updatedMovie)
        Log.d("UpdateWorker", "movie updated!")
        return Result.success()
    }
}

