import { Module } from '@nestjs/common';
import { PlatformApiAdapterService } from './adapter';
import { TextGenerationPlaceholderService } from './text-generation-placeholder.service';
import { PlatformGraphqlClientService } from './clients/platform-graphql-client.service';
import { HttpModule } from '@nestjs/axios';

@Module({
    imports: [
        HttpModule
    ],
    providers: [
        PlatformApiAdapterService,
        TextGenerationPlaceholderService,
        PlatformGraphqlClientService,
    ],
    exports: [
        PlatformApiAdapterService,
        PlatformGraphqlClientService
    ]
})
export class PlatformApiAdapterModule {}
