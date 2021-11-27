package com.mstefanc.moviesapp.core

import okhttp3.Interceptor
import okhttp3.Response

// intercept each leaving request and add the token to the Authorization token
class TokenInterceptor : Interceptor {
    var token: String? = null

    override fun intercept(chain: Interceptor.Chain): Response {
        val original = chain.request()
        val originalUrl = original.url
        if (token == null) {
            return chain.proceed(original)
        }
        val requestBuilder = original.newBuilder()
            .addHeader("Authorization", "Bearer $token")
            .url(originalUrl)
        val request = requestBuilder.build()
        return chain.proceed(request)
    }
}