package com.simplebank.accountservice.controller;

import com.simplebank.accountservice.model.Account;
import com.simplebank.accountservice.repository.AccountRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.Random;
import java.util.UUID;

@RestController
@RequestMapping("/api/accounts")
@CrossOrigin(origins = "*")
public class AccountController {

    @Autowired
    private AccountRepository accountRepository;

    @PostMapping
    public ResponseEntity<?> createAccount(@RequestBody Account account) {
        if (account.getUserId() == null || account.getAccountType() == null) {
            return ResponseEntity.badRequest().body("userId and accountType are required");
        }
        
        account.setId("acc-" + UUID.randomUUID().toString());
        // Generate account number SB-XXXXXXXXX
        Random rand = new Random();
        long number = 100000000L + rand.nextInt(900000000);
        account.setAccountNumber("SB-" + number);
        account.setBalance(BigDecimal.ZERO);
        
        Account savedAccount = accountRepository.save(account);
        return new ResponseEntity<>(savedAccount, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Account> getAccountById(@PathVariable String id) {
        Optional<Account> account = accountRepository.findById(id);
        return account.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/balance")
    public ResponseEntity<?> getAccountBalance(@PathVariable String id) {
        Optional<Account> account = accountRepository.findById(id);
        if (account.isPresent()) {
            return ResponseEntity.ok().body(java.util.Map.of("balance", account.get().getBalance()));
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Account>> getAccountsByUserId(@PathVariable String userId) {
        List<Account> accounts = accountRepository.findByUserId(userId);
        return ResponseEntity.ok(accounts);
    }

    @PutMapping("/{id}/update-balance")
    public ResponseEntity<?> updateBalance(@PathVariable String id, @RequestParam BigDecimal amount) {
        Optional<Account> accountOpt = accountRepository.findById(id);
        if (accountOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Account account = accountOpt.get();
        account.setBalance(account.getBalance().add(amount));
        accountRepository.save(account);
        return ResponseEntity.ok(account);
    }

    @GetMapping("/number/{accountNumber}")
    public ResponseEntity<Account> getAccountByNumber(@PathVariable String accountNumber) {
        Optional<Account> account = accountRepository.findByAccountNumber(accountNumber);
        return account.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
