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

const errorLink = onError(({ graphQLErrors, networkError }) => {
    if (graphQLErrors)
        graphQLErrors.map(({ message, locations, path }) =>
        console.log(
            `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
        )
        );
    if (networkError) console.log(`[Network error]: ${networkError}`);
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
export class PlatformGraphqlClientService {

    private client: ApolloClient<NormalizedCacheObject>

    constructor(
        private readonly configService: ConfigService,
    ) {
        this.client = new ApolloClient<NormalizedCacheObject>({
            link: from([
                errorLink, 
                new HttpLink({ uri: this.configService.get("PLATFORM_GQL_URL"), fetch })
            ]),
            cache: new InMemoryCache(),
            defaultOptions: noCacheOptions
        });
    }

    async query<T = any, TVariables = OperationVariables>(options: QueryOptions<TVariables, T>): Promise<T> {
        const result = await this.client.query(options);

        if (result.error)
            console.error(result.error)

        if (result.errors)
            console.error(result.error)

        return result.data
    }

    mutate<TData = any, TVariables = OperationVariables, TContext = DefaultContext>(options: MutationOptions<TData, TVariables, TContext>): Promise<FetchResult<TData>> {
        return this.client.mutate(options);
    }

}
