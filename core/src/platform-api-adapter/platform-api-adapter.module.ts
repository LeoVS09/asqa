import { Module } from '@nestjs/common';
import { PlatformApiAdapterService } from './adapter';
import { TextGenerationPlaceholderService } from './text-generation-placeholder.service';
import { PlatformGraphqlClientService } from './clients/platform-graphql-client.service';

@Module({
    providers: [
        PlatformApiAdapterService,
        TextGenerationPlaceholderService,
        PlatformGraphqlClientService,
    ],
    exports: [
        PlatformApiAdapterService
    ]
})
export class PlatformApiAdapterModule {}
