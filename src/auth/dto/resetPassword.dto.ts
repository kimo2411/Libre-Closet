import { IsString, MinLength } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { I18nTranslations } from 'src/i18n/generated/i18n.generated';
import { Match } from '../match.decorator';

export class ResetPasswordDto {
  resetCode: string;

  @IsString()
  @MinLength(1)
  email: string;

  @IsString()
  @MinLength(1)
  password: string;

  @Match('password', {
    message: i18nValidationMessage<I18nTranslations>(
      'lang.validation.PASSWORDS_MUST_MATCH',
    ),
  })
  confirmPassword: string;
}
