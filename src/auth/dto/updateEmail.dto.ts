import { IsString, MinLength } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { I18nTranslations } from '../../i18n/generated/i18n.generated';
import { Match } from '../match.decorator';

export class UpdateEmailDto {
  @IsString()
  @MinLength(1)
  email: string;

  @Match('email', {
    message: i18nValidationMessage<I18nTranslations>(
      'lang.validation.EMAIL_MUST_MATCH',
    ),
  })
  confirmEmail: string;
}
