import {
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateQnaDto } from './dto/create-qna.dto';
import { UpdateQnaDto } from './dto/update-qna.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Qna } from './entities/qna.entity';
import { Repository } from 'typeorm';

@Injectable()
export class QnaService {
  @InjectRepository(Qna)
  private qnaRepository: Repository<Qna>;

  async create(createQnaDto: CreateQnaDto) {
    try {
      const question = {
        ...createQnaDto,
      };

      await this.qnaRepository.save(question);
      return {
        status: HttpStatus.CREATED,
        message: 'Question created successfully',
        data: question,
      };
    } catch (e) {
      throw new InternalServerErrorException(
        `Failed to create question. : ${e}`,
      );
    }
  }

  async createOrUpdateAnswer(id, answer: UpdateQnaDto) {
    try {
      const question = await this.qnaRepository.findOneBy({ id });
      if (!question) {
        throw new NotFoundException('Question not found.');
      }
      await this.qnaRepository.update(id, answer);
      const newAnswer = await this.qnaRepository.findOneBy({ id });

      return {
        status: HttpStatus.OK,
        message: `Question(${id}) answered and updated successfully`,
        data: newAnswer,
      };
    } catch (e) {
      if (e instanceof NotFoundException) {
        throw e;
      }
      throw new InternalServerErrorException(
        `Failed to answer or update the question. : ${e}`,
      );
    }
  }

  async findAllQuestions() {
    try {
      const questions = await this.qnaRepository.find({
        order: { id: 'DESC' },
      });
      return {
        status: HttpStatus.OK,
        message: 'All questions retrieved successfully',
        data: questions,
      };
    } catch (e) {
      throw new InternalServerErrorException(
        `Failed to fetch questions : ${e}`,
      );
    }
  }

  async findOneQuestion(id: number) {
    try {
      const question = await this.qnaRepository.findOneBy({ id });
      if (!question) {
        throw new NotFoundException('Question not found.');
      }

      return {
        status: HttpStatus.OK,
        message: `Question(${id}) retrieved successfully`,
        data: question,
      };
    } catch (e) {
      if (e instanceof NotFoundException) {
        throw e;
      }
      throw new InternalServerErrorException(
        `Failed to fetch question(${id}) : ${e}`,
      );
    }
  }

  async remove(id: number) {
    try {
      const question = await this.qnaRepository.findOneBy({ id });
      if (!question) {
        throw new NotFoundException('Question not found.');
      }

      await this.qnaRepository.delete(id);
      return {
        status: HttpStatus.OK,
        message: `Question(${id}) deleted successfully`,
      };
    } catch (e) {
      if (e instanceof NotFoundException) {
        throw e;
      }
      throw new InternalServerErrorException(
        `Failed to delete question(${id}) : ${e}`,
      );
    }
  }
}
