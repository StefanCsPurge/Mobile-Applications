package com.mstefanc.moviesapp.auth.data.remote

import com.mstefanc.moviesapp.auth.data.TokenHolder
import com.mstefanc.moviesapp.auth.data.User
import com.mstefanc.moviesapp.core.Api
import com.mstefanc.moviesapp.core.Result
import retrofit2.http.Body
import retrofit2.http.Headers
import retrofit2.http.POST

object RemoteAuthDataSource {
    interface AuthService {
        @Headers("Content-Type: application/json")
        @POST("/api/auth/login")
        suspend fun login(@Body user: User): TokenHolder
    }

    private val authService: AuthService = Api.retrofit.create(AuthService::class.java)

    suspend fun login(user: User): Result<TokenHolder> {
        return try {
            Result.Success(authService.login(user))
        } catch (e: Exception) {
            Result.Error(e)
        }
    }
}

