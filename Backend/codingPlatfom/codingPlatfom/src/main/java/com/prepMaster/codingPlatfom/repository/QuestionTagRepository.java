package com.prepMaster.codingPlatfom.repository;

import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.prepMaster.codingPlatfom.entity.QuestionTag;

public interface QuestionTagRepository extends JpaRepository<QuestionTag, Long> {
	List<QuestionTag> findByIdIn(Collection<Long> ids);
}
