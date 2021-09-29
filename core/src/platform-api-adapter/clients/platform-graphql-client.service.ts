import { Injectable } from '@nestjs/common';
import {
    ApolloClient,
    InMemoryCache,
    DefaultOptions,
    NormalizedCacheObject,
    OperationVariables,
    QueryOptions,
    ApolloQueryResult,
    DefaultContext,
    MutationOptions,
    FetchResult,
    HttpLink,
    from
  } from "@apollo/client";
import { onError } from "@apollo/client/link/error";
import { ConfigService } from '@nestjs/config';
import fetch from 'cross-fetch';
import { HealthIndicatorResult, HttpHealthIndicator } from '@nestjs/terminus';
import { ModuleRef } from '@nestjs/core';

const errorLink = onError(({ graphQLErrors, networkError }) => {
    if (graphQLErrors)
        graphQLErrors.map(({ message, locations, path }) =>
            console.error(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`)
        );
    if (networkError) 
        console.error(`[Network error]: ${networkError}`);
});

const noCacheOptions: DefaultOptions = {
    watchQuery: {
      fetchPolicy: 'no-cache',
      errorPolicy: 'ignore',
    },
    query: {
      fetchPolicy: 'no-cache',
      errorPolicy: 'all',
    },
}

@Injectable()
export class PlatformGraphqlClientService extends HttpHealthIndicator {

    private client: ApolloClient<NormalizedCacheObject>
    private host: string
    private gqlUrl: string
    private healthUrl: string

    constructor(
        moduleRef: ModuleRef,
        private readonly configService: ConfigService,
    ) {
        super(moduleRef)

        this.host = this.configService.get("PLATFORM_URL")
        this.gqlUrl = `${this.host}/graphql`
        this.healthUrl = `${this.host}/.well-known/apollo/server-health`

        this.client = new ApolloClient<NormalizedCacheObject>({
            link: from([
                errorLink, 
                new HttpLink({ uri: this.gqlUrl, fetch })
            ]),
            cache: new InMemoryCache(),
            defaultOptions: noCacheOptions
        });
    }

    async query<T = any, TVariables = OperationVariables>(options: QueryOptions<TVariables, T>): Promise<T | null> {
        const result = await this.client.query(options);

        if (result.error)
            console.error(result.error)

        if (result.errors)
            console.error(result.errors)

        return result.data
    }

    async mutate<TData = any, TVariables = OperationVariables, TContext = DefaultContext>(options: MutationOptions<TData, TVariables, TContext>): Promise<TData | null> {
        const result = await this.client.mutate(options);

        if (result.errors)
            console.error(result.errors)

        return result.data
    }

    async isHealth(key: string): Promise<HealthIndicatorResult> {
        return await this.pingCheck(key, this.healthUrl)
    }

}
