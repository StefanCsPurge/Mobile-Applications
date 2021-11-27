package com.mstefanc.moviesapp.moviepack.data.remote

import com.mstefanc.moviesapp.core.Api
import com.mstefanc.moviesapp.moviepack.data.Movie
import retrofit2.http.*

object MovieApi {
    interface Service {
        @GET("/api/movies")
        suspend fun find(): List<Movie>

        @GET("/api/movies/{id}")
        suspend fun read(@Path("id") movieId: String): Movie

        @Headers("Content-Type: application/json")
        @POST("/api/movies")
        suspend fun create(@Body movie: Movie): Movie

        @Headers("Content-Type: application/json")
        @PUT("/api/movies/{id}")
        suspend fun update(@Path("id") movieId: String, @Body movie: Movie): Movie

        @DELETE("/api/movies/{id}")
        suspend fun delete(@Path("id") movieId: String)
    }

    val service: Service = Api.retrofit.create(Service::class.java)
}